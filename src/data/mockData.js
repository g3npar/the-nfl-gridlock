// ─── Position definitions ─────────────────────────────────────────────────────
export const positions = [
  {
    id: 'QB',
    label: 'QB',
    fullName: 'Quarterback',
    searchType: 'player',
    color: '#3b82f6',
    constraints: [
      { text: 'Chiefs or Bengals', teams: ['Kansas City Chiefs', 'Cincinnati Bengals'] },
      { text: 'Season: 2015–2024' },
      { text: 'Pro Bowl: 3+ appearances' },
    ],
    // Structured filters used by UI
    yearMin: 2015, yearMax: 2024,
    eligibleTeams: ['Kansas City Chiefs', 'Cincinnati Bengals'],
    eligiblePositions: ['QB'],
  },
  {
    id: 'RB',
    label: 'RB',
    fullName: 'Running Back',
    searchType: 'player',
    color: '#22c55e',
    constraints: [
      { text: 'No NFC East team', teams: ['Dallas Cowboys', 'New York Giants', 'Philadelphia Eagles', 'Washington Commanders'], excluded: true },
      { text: 'Season: 2000–2020' },
      { text: '1,500+ rush yards' },
    ],
    yearMin: 2000, yearMax: 2020,
    excludeTeams: ['Dallas Cowboys', 'New York Giants', 'Philadelphia Eagles', 'Washington Commanders', 'Washington Redskins', 'Washington Football Team'],
    eligiblePositions: ['RB'],
  },
  {
    id: 'WR',
    label: 'WR',
    fullName: 'Wide Receiver',
    searchType: 'player',
    color: '#f59e0b',
    constraints: [
      { text: 'Packers or Bears', teams: ['Green Bay Packers', 'Chicago Bears'] },
      { text: 'Season: 1990–2010' },
      { text: '1+ Super Bowl ring' },
    ],
    yearMin: 1990, yearMax: 2010,
    eligibleTeams: ['Green Bay Packers', 'Chicago Bears'],
    eligiblePositions: ['WR'],
  },
  {
    id: 'TE',
    label: 'TE',
    fullName: 'Tight End',
    searchType: 'player',
    color: '#a855f7',
    constraints: [
      { text: 'Kansas City Chiefs', teams: ['Kansas City Chiefs'] },
      { text: 'Season: 2013–2024' },
      { text: '10+ receiving TDs' },
    ],
    yearMin: 2013, yearMax: 2024,
    eligibleTeams: ['Kansas City Chiefs'],
    eligiblePositions: ['TE'],
  },
  {
    id: 'DEF',
    label: 'DEF',
    fullName: 'Team Defense',
    searchType: 'team',
    color: '#0ea5e9',
    constraints: [
      { text: 'Baltimore Ravens' },
      { text: 'Season: 2000–2015' },
      { text: '1+ Super Bowl' },
    ],
    yearMin: 2000, yearMax: 2015,
    eligibleTeams: ['Baltimore Ravens'],
  },
  {
    id: 'DP',
    label: 'DP',
    fullName: 'Defensive Player',
    searchType: 'player',
    color: '#ef4444',
    constraints: [
      { text: 'EDGE or LB' },
      { text: 'Season: 2005–2024' },
      { text: '10+ sacks' },
    ],
    yearMin: 2005, yearMax: 2024,
    eligiblePositions: ['EDGE', 'LB', 'LB/EDGE', 'DE', 'DT'],
  },
]

// ─── Individual players ───────────────────────────────────────────────────────
export const mockPlayers = [
  // QBs
  { id: 1,  name: 'Patrick Mahomes',     position: 'QB',   team: 'Kansas City Chiefs',    primaryTeam: 'Kansas City Chiefs',   years: '2017–present', mockPoints: 412 },
  { id: 2,  name: 'Joe Burrow',          position: 'QB',   team: 'Cincinnati Bengals',    primaryTeam: 'Cincinnati Bengals',   years: '2020–present', mockPoints: 387 },
  { id: 3,  name: 'Lamar Jackson',       position: 'QB',   team: 'Baltimore Ravens',      primaryTeam: 'Baltimore Ravens',     years: '2018–present', mockPoints: 365 },
  { id: 4,  name: 'Tom Brady',           position: 'QB',   team: 'Multiple',              primaryTeam: 'New England Patriots', years: '2000–2022',    mockPoints: 398 },
  { id: 5,  name: 'Peyton Manning',      position: 'QB',   team: 'Colts / Broncos',       primaryTeam: 'Indianapolis Colts',   years: '1998–2015',    mockPoints: 421 },
  { id: 6,  name: 'Aaron Rodgers',       position: 'QB',   team: 'Packers / Jets',        primaryTeam: 'Green Bay Packers',    years: '2005–present', mockPoints: 374 },
  { id: 7,  name: 'Drew Brees',          position: 'QB',   team: 'Chargers / Saints',     primaryTeam: 'New Orleans Saints',   years: '2001–2020',    mockPoints: 356 },

  // RBs
  { id: 8,  name: 'Adrian Peterson',     position: 'RB',   team: 'Multiple',              primaryTeam: 'Minnesota Vikings',    years: '2007–2021',    mockPoints: 328 },
  { id: 9,  name: 'LaDainian Tomlinson', position: 'RB',   team: 'Chargers / Jets',       primaryTeam: 'Los Angeles Chargers', years: '2001–2011',    mockPoints: 356 },
  { id: 10, name: 'Chris Johnson',       position: 'RB',   team: 'Multiple',              primaryTeam: 'Tennessee Titans',     years: '2008–2016',    mockPoints: 287 },
  { id: 11, name: 'Marshawn Lynch',      position: 'RB',   team: 'Bills / Seahawks / Raiders', primaryTeam: 'Seattle Seahawks', years: '2007–2019',    mockPoints: 312 },
  { id: 12, name: 'Barry Sanders',       position: 'RB',   team: 'Detroit Lions',         primaryTeam: 'Detroit Lions',        years: '1989–1998',    mockPoints: 344 },
  { id: 13, name: 'Frank Gore',          position: 'RB',   team: 'Multiple',              primaryTeam: 'San Francisco 49ers',  years: '2005–2020',    mockPoints: 271 },

  // WRs
  { id: 14, name: 'Donald Driver',       position: 'WR',   team: 'Green Bay Packers',     primaryTeam: 'Green Bay Packers',    years: '1999–2012',    mockPoints: 245 },
  { id: 15, name: 'Jerry Rice',          position: 'WR',   team: '49ers / Raiders / Seahawks', primaryTeam: 'San Francisco 49ers', years: '1985–2004',    mockPoints: 389 },
  { id: 16, name: 'Randy Moss',          position: 'WR',   team: 'Multiple',              primaryTeam: 'Minnesota Vikings',    years: '1998–2012',    mockPoints: 356 },
  { id: 17, name: 'Calvin Johnson',      position: 'WR',   team: 'Detroit Lions',         primaryTeam: 'Detroit Lions',        years: '2007–2015',    mockPoints: 298 },
  { id: 18, name: 'Davante Adams',       position: 'WR',   team: 'Packers / Raiders',     primaryTeam: 'Green Bay Packers',    years: '2014–present', mockPoints: 342 },
  { id: 19, name: 'Marques Colston',     position: 'WR',   team: 'New Orleans Saints',    primaryTeam: 'New Orleans Saints',   years: '2006–2015',    mockPoints: 234 },
  { id: 20, name: 'Dez Bryant',          position: 'WR',   team: 'Dallas Cowboys',        primaryTeam: 'Dallas Cowboys',       years: '2010–2018',    mockPoints: 268 },

  // TEs
  { id: 21, name: 'Travis Kelce',        position: 'TE',   team: 'Kansas City Chiefs',    primaryTeam: 'Kansas City Chiefs',   years: '2013–present', mockPoints: 367 },
  { id: 22, name: 'Tony Gonzalez',       position: 'TE',   team: 'Chiefs / Falcons',      primaryTeam: 'Kansas City Chiefs',   years: '1997–2013',    mockPoints: 298 },
  { id: 23, name: 'Rob Gronkowski',      position: 'TE',   team: 'Patriots / Buccaneers', primaryTeam: 'New England Patriots', years: '2010–2022',    mockPoints: 334 },
  { id: 24, name: 'Antonio Gates',       position: 'TE',   team: 'San Diego Chargers',    primaryTeam: 'Los Angeles Chargers', years: '2003–2018',    mockPoints: 267 },
  { id: 25, name: 'Jason Witten',        position: 'TE',   team: 'Cowboys / Raiders',     primaryTeam: 'Dallas Cowboys',       years: '2003–2020',    mockPoints: 256 },

  // Defensive Players (for DP slot)
  { id: 26, name: 'Aaron Donald',        position: 'DT',      team: 'Los Angeles Rams',           primaryTeam: 'Los Angeles Rams',      years: '2014–2022',    mockPoints: 189 },
  { id: 27, name: 'Von Miller',          position: 'EDGE',    team: 'Broncos / Rams / Bills',     primaryTeam: 'Denver Broncos',        years: '2011–2023',    mockPoints: 167 },
  { id: 28, name: 'Micah Parsons',       position: 'LB/EDGE', team: 'Dallas Cowboys',             primaryTeam: 'Dallas Cowboys',        years: '2021–present', mockPoints: 178 },
  { id: 29, name: 'Ray Lewis',           position: 'LB',      team: 'Baltimore Ravens',           primaryTeam: 'Baltimore Ravens',      years: '1996–2012',    mockPoints: 156 },
  { id: 30, name: 'Khalil Mack',         position: 'EDGE',    team: 'Raiders / Bears / Chargers', primaryTeam: 'Las Vegas Raiders',     years: '2014–present', mockPoints: 145 },
  { id: 31, name: 'Myles Garrett',       position: 'EDGE',    team: 'Cleveland Browns',           primaryTeam: 'Cleveland Browns',      years: '2017–present', mockPoints: 163 },
  { id: 32, name: 'T.J. Watt',           position: 'EDGE',    team: 'Pittsburgh Steelers',        primaryTeam: 'Pittsburgh Steelers',   years: '2017–present', mockPoints: 171 },
  { id: 33, name: 'Demarcus Ware',       position: 'EDGE',    team: 'Cowboys / Broncos',          primaryTeam: 'Dallas Cowboys',        years: '2005–2016',    mockPoints: 158 },
  { id: 34, name: 'Jared Allen',         position: 'DE',      team: 'Multiple',                   primaryTeam: 'Minnesota Vikings',     years: '2004–2015',    mockPoints: 149 },
  { id: 35, name: 'Lawrence Taylor',     position: 'LB',      team: 'New York Giants',            primaryTeam: 'New York Giants',       years: '1981–1993',    mockPoints: 181 },
]

// ─── Team defenses (for DEF slot) ────────────────────────────────────────────
export const mockTeamDefenses = [
  { id: 'd1',  name: 'Baltimore Ravens',       abbreviation: 'BAL', primaryTeam: 'Baltimore Ravens',     years: '1996–present', mockPoints: 178 },
  { id: 'd2',  name: 'New England Patriots',   abbreviation: 'NE',  primaryTeam: 'New England Patriots', years: '1960–present', mockPoints: 165 },
  { id: 'd3',  name: 'Pittsburgh Steelers',    abbreviation: 'PIT', primaryTeam: 'Pittsburgh Steelers',  years: '1933–present', mockPoints: 172 },
  { id: 'd4',  name: 'Seattle Seahawks',       abbreviation: 'SEA', primaryTeam: 'Seattle Seahawks',     years: '1976–present', mockPoints: 182 },
  { id: 'd5',  name: 'Denver Broncos',         abbreviation: 'DEN', primaryTeam: 'Denver Broncos',       years: '1960–present', mockPoints: 157 },
  { id: 'd6',  name: 'Tampa Bay Buccaneers',   abbreviation: 'TB',  primaryTeam: 'Tampa Bay Buccaneers', years: '1976–present', mockPoints: 169 },
  { id: 'd7',  name: 'Chicago Bears',          abbreviation: 'CHI', primaryTeam: 'Chicago Bears',        years: '1920–present', mockPoints: 155 },
  { id: 'd8',  name: 'San Francisco 49ers',    abbreviation: 'SF',  primaryTeam: 'San Francisco 49ers',  years: '1946–present', mockPoints: 161 },
  { id: 'd9',  name: 'Kansas City Chiefs',     abbreviation: 'KC',  primaryTeam: 'Kansas City Chiefs',   years: '1960–present', mockPoints: 148 },
  { id: 'd10', name: 'Dallas Cowboys',         abbreviation: 'DAL', primaryTeam: 'Dallas Cowboys',       years: '1960–present', mockPoints: 143 },
  { id: 'd11', name: 'Green Bay Packers',      abbreviation: 'GB',  primaryTeam: 'Green Bay Packers',    years: '1919–present', mockPoints: 151 },
  { id: 'd12', name: 'Los Angeles Rams',       abbreviation: 'LAR', primaryTeam: 'Los Angeles Rams',     years: '1936–present', mockPoints: 176 },
  { id: 'd13', name: 'Minnesota Vikings',      abbreviation: 'MIN', primaryTeam: 'Minnesota Vikings',    years: '1961–present', mockPoints: 139 },
  { id: 'd14', name: 'Philadelphia Eagles',    abbreviation: 'PHI', primaryTeam: 'Philadelphia Eagles',  years: '1933–present', mockPoints: 158 },
  { id: 'd15', name: 'New York Giants',        abbreviation: 'NYG', primaryTeam: 'New York Giants',      years: '1925–present', mockPoints: 142 },
]

// ─── Season year options (newest first) ──────────────────────────────────────
export const yearRange = Array.from({ length: 57 }, (_, i) => 2026 - i)
