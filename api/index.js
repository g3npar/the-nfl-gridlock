require('dotenv').config({ path: '../.env' })
const express = require('express')
const cors    = require('cors')
const { Pool } = require('pg')

const app  = express()
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

app.use(cors())
app.use(express.json())

// ── Full name → abbreviation map ──────────────────────────────────────────────
const TEAM_ABB = {
  'Arizona Cardinals': 'ARI', 'Atlanta Falcons': 'ATL', 'Baltimore Ravens': 'BAL',
  'Buffalo Bills': 'BUF', 'Carolina Panthers': 'CAR', 'Chicago Bears': 'CHI',
  'Cincinnati Bengals': 'CIN', 'Cleveland Browns': 'CLE', 'Dallas Cowboys': 'DAL',
  'Denver Broncos': 'DEN', 'Detroit Lions': 'DET', 'Green Bay Packers': 'GB',
  'Houston Texans': 'HOU', 'Indianapolis Colts': 'IND', 'Jacksonville Jaguars': 'JAX',
  'Kansas City Chiefs': 'KC', 'Las Vegas Raiders': 'LV', 'Los Angeles Chargers': 'LAC',
  'Los Angeles Rams': 'LA', 'Miami Dolphins': 'MIA', 'Minnesota Vikings': 'MIN',
  'New England Patriots': 'NE', 'New Orleans Saints': 'NO', 'New York Giants': 'NYG',
  'New York Jets': 'NYJ', 'Philadelphia Eagles': 'PHI', 'Pittsburgh Steelers': 'PIT',
  'San Francisco 49ers': 'SF', 'Seattle Seahawks': 'SEA', 'Tampa Bay Buccaneers': 'TB',
  'Tennessee Titans': 'TEN', 'Washington Commanders': 'WAS',
  // Historical
  'Oakland Raiders': 'LV', 'San Diego Chargers': 'LAC', 'St. Louis Rams': 'LA',
  'Washington Redskins': 'WAS', 'Washington Football Team': 'WAS',
}

const toAbb = name => TEAM_ABB[name] || name

// ── GET /players/search?q=mahomes&position=QB ─────────────────────────────────
app.get('/players/search', async (req, res) => {
  const { q = '', position, yearMin, yearMax, teams, excludeTeams } = req.query
  if (q.length < 2) return res.json([])

  const conditions = ['p.name ILIKE $1']
  const params     = [`%${q}%`]

  if (position)     { params.push(position);              conditions.push(`p.position = $${params.length}`) }
  if (yearMin)      { params.push(parseInt(yearMin));     conditions.push(`ps.season_year >= $${params.length}`) }
  if (yearMax)      { params.push(parseInt(yearMax));     conditions.push(`ps.season_year <= $${params.length}`) }
  if (teams)        { params.push(teams.split(',').map(toAbb)); conditions.push(`ps.team = ANY($${params.length})`) }
  if (excludeTeams) { params.push(excludeTeams.split(',').map(toAbb)); conditions.push(`ps.team != ALL($${params.length})`) }

  params.push(10)
  const limitIdx = params.length

  const { rows } = await pool.query(`
    SELECT p.id, p.name, p.position, p.nfl_id,
           array_agg(DISTINCT ps.team ORDER BY ps.team) AS teams,
           min(ps.season_year) AS first_season,
           max(ps.season_year) AS last_season
    FROM players p
    JOIN player_seasons ps ON ps.player_id = p.id
    WHERE ${conditions.join(' AND ')}
    GROUP BY p.id, p.name, p.position, p.nfl_id
    LIMIT $${limitIdx}
  `, params)

  res.json(rows)
})

// ── GET /players/:id/seasons ──────────────────────────────────────────────────
app.get('/players/:id/seasons', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT season_year, team, fpts, rush_yards, rec_tds, pro_bowl
    FROM player_seasons
    WHERE player_id = $1
    ORDER BY season_year DESC
  `, [req.params.id])

  res.json(rows)
})

// ── POST /validate ────────────────────────────────────────────────────────────
// Body: { playerId, year, constraints: [{ type, value }] }
// constraint types: team, excludeTeam, minYear, maxYear, minRushYards,
//                   minRecTDs, proBowlMin
app.post('/validate', async (req, res) => {
  const { playerId, year, constraints = [] } = req.body
  if (!playerId || !year) return res.status(400).json({ error: 'playerId and year required' })

  const { rows } = await pool.query(`
    SELECT ps.*, p.name, p.position
    FROM player_seasons ps
    JOIN players p ON p.id = ps.player_id
    WHERE ps.player_id = $1 AND ps.season_year = $2
  `, [playerId, year])

  if (!rows.length) return res.json({ valid: false, reason: 'No season found for that player/year', fpts: 0 })

  const season = rows[0]
  const fails  = []

  for (const c of constraints) {
    switch (c.type) {
      case 'team':
        if (!c.values.map(toAbb).includes(season.team)) fails.push(`Must play for ${c.values.join(' or ')}`)
        break
      case 'excludeTeam':
        if (c.values.map(toAbb).includes(season.team)) fails.push(`Cannot be from ${c.values.join(', ')}`)
        break
      case 'minYear':
        if (year < c.value) fails.push(`Season must be ${c.value} or later`)
        break
      case 'maxYear':
        if (year > c.value) fails.push(`Season must be ${c.value} or earlier`)
        break
      case 'minRushYards':
        if ((season.rush_yards ?? 0) < c.value) fails.push(`Need ${c.value}+ rush yards (had ${season.rush_yards ?? 0})`)
        break
      case 'minRecTDs':
        if ((season.rec_tds ?? 0) < c.value) fails.push(`Need ${c.value}+ receiving TDs (had ${season.rec_tds ?? 0})`)
        break
      case 'proBowlMin':
        if (!season.pro_bowl) fails.push(`Must be a Pro Bowl season`)
        break
    }
  }

  res.json({
    valid:  fails.length === 0,
    reason: fails[0] ?? null,
    fpts:   parseFloat(season.fpts) || 0,
    season,
  })
})

const PORT = process.env.API_PORT || 3001
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`))
