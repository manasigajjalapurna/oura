import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'oura-health.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

export function initializeDatabase() {
  // Oura Sleep Data
  db.exec(`
    CREATE TABLE IF NOT EXISTS oura_sleep (
      id TEXT PRIMARY KEY,
      day DATE NOT NULL,
      bedtime_start DATETIME,
      bedtime_end DATETIME,
      total_sleep_duration INTEGER,
      awake_time INTEGER,
      light_sleep_duration INTEGER,
      deep_sleep_duration INTEGER,
      rem_sleep_duration INTEGER,
      restless_periods INTEGER,
      average_hrv REAL,
      average_heart_rate REAL,
      lowest_heart_rate REAL,
      efficiency INTEGER,
      latency INTEGER,
      temperature_delta REAL,
      respiratory_rate REAL,
      raw_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(day)
    )
  `);

  // Oura Daily Activity
  db.exec(`
    CREATE TABLE IF NOT EXISTS oura_activity (
      id TEXT PRIMARY KEY,
      day DATE NOT NULL,
      steps INTEGER,
      active_calories INTEGER,
      total_calories INTEGER,
      target_calories INTEGER,
      met_min_high INTEGER,
      met_min_medium INTEGER,
      met_min_low INTEGER,
      average_met REAL,
      sedentary_time INTEGER,
      resting_time INTEGER,
      inactivity_alerts INTEGER,
      low_activity_met INTEGER,
      medium_activity_met INTEGER,
      high_activity_met INTEGER,
      raw_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(day)
    )
  `);

  // Oura Workouts
  db.exec(`
    CREATE TABLE IF NOT EXISTS oura_workouts (
      id TEXT PRIMARY KEY,
      day DATE NOT NULL,
      activity TEXT,
      start_datetime DATETIME,
      end_datetime DATETIME,
      calories INTEGER,
      intensity TEXT,
      average_hr REAL,
      max_hr REAL,
      distance REAL,
      raw_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Oura Daily Readiness
  db.exec(`
    CREATE TABLE IF NOT EXISTS oura_readiness (
      id TEXT PRIMARY KEY,
      day DATE NOT NULL,
      score INTEGER,
      temperature_deviation REAL,
      temperature_trend_deviation REAL,
      activity_balance INTEGER,
      body_temperature REAL,
      hrv_balance INTEGER,
      previous_day_activity INTEGER,
      previous_night INTEGER,
      recovery_index INTEGER,
      resting_heart_rate INTEGER,
      sleep_balance INTEGER,
      raw_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(day)
    )
  `);

  // Oura Daily Stress
  db.exec(`
    CREATE TABLE IF NOT EXISTS oura_stress (
      id TEXT PRIMARY KEY,
      day DATE NOT NULL,
      stress_high INTEGER,
      recovery_high INTEGER,
      day_summary TEXT,
      raw_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(day)
    )
  `);

  // Heart Rate Data (if we want to store detailed HR data)
  db.exec(`
    CREATE TABLE IF NOT EXISTS heart_rate (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME NOT NULL,
      bpm INTEGER NOT NULL,
      source TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User Meals
  db.exec(`
    CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE NOT NULL,
      time TIME,
      description TEXT NOT NULL,
      estimated_portion TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User Goals
  db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      goal_type TEXT NOT NULL,
      target_value TEXT,
      current_value TEXT,
      start_date DATE NOT NULL,
      target_date DATE,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Digests
  db.exec(`
    CREATE TABLE IF NOT EXISTS digests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      digest_type TEXT NOT NULL,
      date DATE NOT NULL,
      content TEXT NOT NULL,
      generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(digest_type, date)
    )
  `);

  // User Notes/Reflections
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE NOT NULL,
      note_type TEXT,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Sync Status - track last sync time for each data type
  db.exec(`
    CREATE TABLE IF NOT EXISTS sync_status (
      data_type TEXT PRIMARY KEY,
      last_sync_date DATE,
      last_sync_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✓ Database initialized successfully');
}

export default db;
