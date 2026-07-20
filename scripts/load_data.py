"""
Loads NFL player season data into RDS PostgreSQL.
Run: python3 scripts/load_data.py
"""

import os
import nfl_data_py as nfl
import nflreadpy
import polars as pl
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set in .env")

# ── Fetch 1999–2025 via nfl_data_py ──────────────────────────────────────────
print("Fetching seasonal stats (1999–2025)...")
import pandas as pd
stats_old = nfl.import_seasonal_data(list(range(1999, 2025)))

print("Fetching player info...")
players_df = nfl.import_players()

# ── Fetch 2025 via nflreadpy + aggregate to seasonal ─────────────────────────
print("Fetching 2025 weekly stats from nflreadpy...")
weekly_2025 = nflreadpy.load_player_stats(seasons=[2025])
seasonal_2025 = (
    weekly_2025
    .filter(pl.col("season_type") == "REG")
    .group_by(["player_id", "player_display_name", "position"])
    .agg([
        pl.lit(2025).alias("season"),
        pl.col("team").mode().first().alias("recent_team"),   # most common team
        pl.sum("fantasy_points_ppr").alias("fantasy_points_ppr"),
        pl.sum("rushing_yards").alias("rushing_yards"),
        pl.sum("receiving_tds").alias("receiving_tds"),
    ])
    .to_pandas()
)
seasonal_2025["pro_bowl"] = False

# ── Connect ───────────────────────────────────────────────────────────────────
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

# ── Build player map from nfl_data_py players ─────────────────────────────────
print("Inserting players...")
merged_old = stats_old.merge(
    players_df[["gsis_id", "display_name", "position", "birth_date"]],
    left_on="player_id", right_on="gsis_id", how="left"
)
unique_old = (
    merged_old[["player_id", "display_name", "position", "birth_date"]]
    .drop_duplicates(subset="player_id")
    .dropna(subset=["display_name"])
)

# Add 2025 players not already in the list
existing_ids = set(unique_old["player_id"])
new_2025 = seasonal_2025[~seasonal_2025["player_id"].isin(existing_ids)][
    ["player_id", "player_display_name", "position"]
].drop_duplicates(subset="player_id")
new_2025 = new_2025.rename(columns={"player_display_name": "display_name"})
new_2025["birth_date"] = None

all_players = pd.concat([unique_old, new_2025], ignore_index=True)
all_players = all_players.dropna(subset=["display_name"])

player_id_map = {}
player_rows = []
for _, row in all_players.iterrows():
    birth_year = None
    if row["birth_date"] and str(row["birth_date"]) != "nan":
        try:
            birth_year = int(str(row["birth_date"])[:4])
        except Exception:
            pass
    player_rows.append((row["player_id"], row["display_name"], row.get("position"), birth_year))

results = execute_values(cur, """
    INSERT INTO players (nfl_id, name, position, birth_year)
    VALUES %s
    ON CONFLICT (nfl_id) DO UPDATE
      SET name = EXCLUDED.name,
          position = EXCLUDED.position,
          birth_year = EXCLUDED.birth_year
    RETURNING id, nfl_id
""", player_rows, fetch=True)

for db_id, nfl_id in results:
    player_id_map[nfl_id] = db_id

conn.commit()
print(f"  {len(player_id_map)} players upserted")

# ── Fetch team per player-season from weekly data ─────────────────────────────
print("Fetching team data from weekly rosters (1999–2025)...")
weekly = nfl.import_weekly_data(list(range(1999, 2025)), columns=['player_id', 'season', 'recent_team'])
# Most common team that season = primary team for that year
team_map = (
    weekly.groupby(['player_id', 'season'])['recent_team']
    .agg(lambda x: x.mode().iloc[0] if len(x) > 0 else None)
    .reset_index()
    .set_index(['player_id', 'season'])['recent_team']
    .to_dict()
)

# ── Insert/update 1999–2024 season rows ──────────────────────────────────────
print("Inserting player seasons (1999–2025)...")
season_rows = []
for _, row in stats_old.iterrows():
    db_id = player_id_map.get(row["player_id"])
    if not db_id:
        continue
    fpts       = row.get("fantasy_points_ppr") or 0
    rush_yards = int(row["rushing_yards"]) if pd.notna(row.get("rushing_yards")) else None
    rec_tds    = int(row["receiving_tds"])   if pd.notna(row.get("receiving_tds"))   else None
    yr         = int(row["season"])
    team       = team_map.get((row["player_id"], yr))
    season_rows.append((db_id, str(team) if team else None, yr, round(float(fpts), 1), rush_yards, rec_tds))

execute_values(cur, """
    INSERT INTO player_seasons (player_id, team, season_year, fpts, rush_yards, rec_tds)
    VALUES %s
    ON CONFLICT (player_id, season_year) DO UPDATE
      SET team       = EXCLUDED.team,
          fpts       = EXCLUDED.fpts,
          rush_yards = EXCLUDED.rush_yards,
          rec_tds    = EXCLUDED.rec_tds
""", season_rows)
conn.commit()
print(f"  {len(season_rows)} rows upserted")

# ── Insert 2025 season rows ───────────────────────────────────────────────────
print("Inserting player seasons (2025)...")
season_rows_2025 = []
for _, row in seasonal_2025.iterrows():
    db_id = player_id_map.get(row["player_id"])
    if not db_id:
        continue
    fpts      = round(float(row["fantasy_points_ppr"] or 0), 1)
    rush_yards = int(row["rushing_yards"]) if pd.notna(row.get("rushing_yards")) else None
    rec_tds    = int(row["receiving_tds"]) if pd.notna(row.get("receiving_tds")) else None
    team       = row.get("recent_team")
    season_rows_2025.append((db_id, str(team) if team else None, 2025, fpts, rush_yards, rec_tds))

execute_values(cur, """
    INSERT INTO player_seasons (player_id, team, season_year, fpts, rush_yards, rec_tds)
    VALUES %s
    ON CONFLICT (player_id, season_year) DO UPDATE
      SET team       = EXCLUDED.team,
          fpts       = EXCLUDED.fpts,
          rush_yards = EXCLUDED.rush_yards,
          rec_tds    = EXCLUDED.rec_tds
""", season_rows_2025)
conn.commit()
print(f"  {len(season_rows_2025)} rows upserted")

cur.close()
conn.close()
print("Done!")