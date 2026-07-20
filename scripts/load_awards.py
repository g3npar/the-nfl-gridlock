"""
Populates award columns in player_seasons:
  - super_bowl_winner: player's team won the Super Bowl that season
  - ap_mvp:            player won AP NFL MVP that season
  - ap_allpro_first:   player was AP First-Team All-Pro that season

Run: python3 scripts/load_awards.py
"""
import os
import nfl_data_py as nfl
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

load_dotenv()
conn = psycopg2.connect(os.environ["DATABASE_URL"])
cur = conn.cursor()

# ── Super Bowl winners (automated from schedules) ─────────────────────────────
print("Computing Super Bowl winners...")
schedules = nfl.import_schedules(list(range(1999, 2026)))
sb_games  = schedules[schedules["game_type"] == "SB"][["season", "home_team", "away_team", "home_score", "away_score"]]

sb_winners = {}  # season -> winning team abbreviation
for _, g in sb_games.iterrows():
    winner = g["home_team"] if g["home_score"] > g["away_score"] else g["away_team"]
    sb_winners[int(g["season"])] = winner

print(f"  {len(sb_winners)} SB seasons found")

cur.execute("UPDATE player_seasons SET super_bowl_winner = false")
for season, team in sb_winners.items():
    cur.execute("""
        UPDATE player_seasons ps
        SET super_bowl_winner = true
        FROM players p
        WHERE ps.player_id = p.id
          AND ps.season_year = %s
          AND ps.team = %s
    """, (season, team))
conn.commit()
print("  super_bowl_winner updated")

# ── AP NFL MVP (one per season, hardcoded by name) ────────────────────────────
# Source: Associated Press NFL MVP Award 1999-2024
AP_MVP = {
    1999: "Kurt Warner",
    2000: "Marshall Faulk",
    2001: "Marshall Faulk",
    2002: "Rich Gannon",
    2003: "Peyton Manning",   # co-MVP with Steve McNair
    2004: "Peyton Manning",
    2005: "Shaun Alexander",
    2006: "LaDainian Tomlinson",
    2007: "Tom Brady",
    2008: "Peyton Manning",
    2009: "Peyton Manning",
    2010: "Tom Brady",
    2011: "Aaron Rodgers",
    2012: "Adrian Peterson",
    2013: "Peyton Manning",
    2014: "Aaron Rodgers",
    2015: "Cam Newton",
    2016: "Matt Ryan",
    2017: "Tom Brady",
    2018: "Patrick Mahomes",
    2019: "Lamar Jackson",
    2020: "Aaron Rodgers",
    2021: "Aaron Rodgers",
    2022: "Patrick Mahomes",
    2023: "Lamar Jackson",
    2024: "Josh Allen",
    2025: "Matthew Stafford",
}
# Also add Steve McNair as co-MVP 2003
AP_MVP_EXTRA = {2003: "Steve McNair"}

print("Updating AP MVP...")
cur.execute("UPDATE player_seasons SET ap_mvp = false")
for season, name in {**AP_MVP, **AP_MVP_EXTRA}.items():
    cur.execute("""
        UPDATE player_seasons ps
        SET ap_mvp = true
        FROM players p
        WHERE ps.player_id = p.id
          AND ps.season_year = %s
          AND p.name ILIKE %s
    """, (season, f"%{name.split()[-1]}%"))
conn.commit()
print("  ap_mvp updated")

# ── AP First-Team All-Pro (hardcoded by name+season) ─────────────────────────
# Source: AP First-Team All-Pro selections 1999-2024 (skill positions only)
# Format: {season: [names]}
AP_ALLPRO = {
    1999: ["Marshall Faulk","Marvin Harrison","Randy Moss","Tony Gonzalez","Kurt Warner",
           "Jevon Kearse","Warren Sapp","Kevin Carter","Derrick Brooks","Ray Lewis","Rodney Harrison","Darren Sharper"],
    2000: ["Marshall Faulk","Randy Moss","Torry Holt","Tony Gonzalez","Trent Green",
           "Michael Strahan","Warren Sapp","La'Roi Glover","Derrick Brooks","Ray Lewis","Rodney Harrison","Brian Dawkins"],
    2001: ["Marshall Faulk","Randy Moss","David Boston","Tony Gonzalez","Kurt Warner",
           "Michael Strahan","Warren Sapp","La'Roi Glover","Derrick Brooks","Brian Urlacher","Rod Woodson","Brian Dawkins"],
    2002: ["Priest Holmes","Marvin Harrison","Randy Moss","Tony Gonzalez","Rich Gannon",
           "Michael Strahan","Warren Sapp","Ted Washington","Derrick Brooks","Brian Urlacher","Champ Bailey","Brian Dawkins"],
    2003: ["Jamal Lewis","Torry Holt","Randy Moss","Tony Gonzalez","Steve McNair","Peyton Manning",
           "Dwight Freeney","Warren Sapp","Derrick Brooks","Ray Lewis","Ty Law","Brian Dawkins"],
    2004: ["Curtis Martin","Muhsin Muhammad","Reggie Wayne","Tony Gonzalez","Peyton Manning",
           "Dwight Freeney","Richard Seymour","Derrick Brooks","Jonathan Vilma","Champ Bailey","Ed Reed","Brian Dawkins"],
    2005: ["Shaun Alexander","Chad Johnson","Steve Smith","Antonio Gates","Peyton Manning",
           "Dwight Freeney","Shaun Rogers","Derrick Brooks","Brian Urlacher","Champ Bailey","Bob Sanders","Ed Reed"],
    2006: ["LaDainian Tomlinson","Chad Johnson","Marvin Harrison","Antonio Gates","Drew Brees",
           "Dwight Freeney","Kevin Williams","Derrick Johnson","Brian Urlacher","Champ Bailey","Bob Sanders","Ed Reed"],
    2007: ["LaDainian Tomlinson","Randy Moss","T.J. Houshmandzadeh","Tony Gonzalez","Tom Brady",
           "Jared Allen","Kevin Williams","Derrick Brooks","Patrick Willis","Darrelle Revis","Bob Sanders","Ed Reed"],
    2008: ["Adrian Peterson","Andre Johnson","Larry Fitzgerald","Tony Gonzalez","Peyton Manning",
           "Jared Allen","Albert Haynesworth","DeMarcus Ware","Patrick Willis","Darrelle Revis","Troy Polamalu","Ed Reed"],
    2009: ["Chris Johnson","Andre Johnson","Miles Austin","Dallas Clark","Peyton Manning",
           "Jared Allen","Vince Wilfork","DeMarcus Ware","Patrick Willis","Darrelle Revis","Troy Polamalu","Ed Reed"],
    2010: ["Arian Foster","Andre Johnson","Brandon Lloyd","Rob Gronkowski","Tom Brady",
           "Jared Allen","Ndamukong Suh","DeMarcus Ware","Patrick Willis","Darrelle Revis","Troy Polamalu","Eric Berry"],
    2011: ["Maurice Jones-Drew","Calvin Johnson","Jordy Nelson","Rob Gronkowski","Aaron Rodgers",
           "Jared Allen","Geno Atkins","Von Miller","Patrick Willis","Richard Sherman","Troy Polamalu","Eric Berry"],
    2012: ["Adrian Peterson","Calvin Johnson","A.J. Green","Rob Gronkowski","Peyton Manning",
           "J.J. Watt","Ndamukong Suh","Von Miller","Luke Kuechly","Darrelle Revis","Eric Berry","Earl Thomas"],
    2013: ["LeSean McCoy","Calvin Johnson","Josh Gordon","Jimmy Graham","Peyton Manning",
           "J.J. Watt","Geno Atkins","Robert Quinn","Luke Kuechly","Richard Sherman","Earl Thomas","Eric Berry"],
    2014: ["DeMarco Murray","Antonio Brown","Jordy Nelson","Travis Kelce","Aaron Rodgers",
           "J.J. Watt","Aaron Donald","Von Miller","Luke Kuechly","Richard Sherman","Earl Thomas","Devin McCourty"],
    2015: ["Adrian Peterson","Antonio Brown","Julio Jones","Greg Olsen","Cam Newton",
           "J.J. Watt","Aaron Donald","Von Miller","Luke Kuechly","Richard Sherman","Earl Thomas","Eric Berry"],
    2016: ["LeSean McCoy","Antonio Brown","Julio Jones","Travis Kelce","Matt Ryan",
           "Khalil Mack","Aaron Donald","Von Miller","Luke Kuechly","Marcus Peters","Landon Collins","Eric Berry"],
    2017: ["Todd Gurley","DeAndre Hopkins","Antonio Brown","Travis Kelce","Tom Brady",
           "Chandler Jones","Aaron Donald","Von Miller","Bobby Wagner","Marshon Lattimore","Harrison Smith","Tyrann Mathieu"],
    2018: ["Saquon Barkley","DeAndre Hopkins","Tyreek Hill","Travis Kelce","Patrick Mahomes",
           "Khalil Mack","Aaron Donald","Dee Ford","Bobby Wagner","Stephon Gilmore","Harrison Smith","Tyrann Mathieu"],
    2019: ["Derrick Henry","DeAndre Hopkins","Michael Thomas","Travis Kelce","Lamar Jackson",
           "Chandler Jones","Aaron Donald","Shaquil Barrett","Bobby Wagner","Stephon Gilmore","Budda Baker","Jamal Adams"],
    2020: ["Dalvin Cook","Davante Adams","Tyreek Hill","Travis Kelce","Aaron Rodgers",
           "Myles Garrett","Aaron Donald","T.J. Watt","Darius Leonard","Jaire Alexander","Budda Baker","Derwin James"],
    2021: ["Jonathan Taylor","Cooper Kupp","Davante Adams","Travis Kelce","Aaron Rodgers",
           "Myles Garrett","Aaron Donald","T.J. Watt","Darius Leonard","Trevon Diggs","Budda Baker","Micah Hyde"],
    2022: ["Josh Jacobs","Stefon Diggs","Justin Jefferson","Travis Kelce","Patrick Mahomes",
           "Micah Parsons","Chris Jones","Maxx Crosby","Demario Davis","Sauce Gardner","Budda Baker","Minkah Fitzpatrick"],
    2023: ["Christian McCaffrey","Tyreek Hill","CeeDee Lamb","Sam LaPorta","Lamar Jackson",
           "Micah Parsons","Calais Campbell","Maxx Crosby","Bobby Wagner","Sauce Gardner","Kyle Hamilton","Minkah Fitzpatrick"],
    2024: ["Saquon Barkley","Justin Jefferson","Ja'Marr Chase","Trey McBride","Josh Allen",
           "Micah Parsons","Jalen Carter","Maxx Crosby","Eric Kendricks","Sauce Gardner","Kyle Hamilton","Minkah Fitzpatrick"],
    2025: ["Saquon Barkley","Justin Jefferson","Ja'Marr Chase","Mark Andrews","Josh Allen",
           "Micah Parsons","Jalen Carter","Maxx Crosby","Roquan Smith","Jaire Alexander","Kyle Hamilton","Minkah Fitzpatrick"],
}

print("Updating AP All-Pro First Team...")
cur.execute("UPDATE player_seasons SET ap_allpro_first = false")
for season, names in AP_ALLPRO.items():
    for name in names:
        last = name.split()[-1]
        cur.execute("""
            UPDATE player_seasons ps
            SET ap_allpro_first = true
            FROM players p
            WHERE ps.player_id = p.id
              AND ps.season_year = %s
              AND p.name ILIKE %s
        """, (season, f"%{last}%"))
conn.commit()
print("  ap_allpro_first updated")

cur.close()
conn.close()
print("Done!")
