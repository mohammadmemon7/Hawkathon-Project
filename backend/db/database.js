const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'sehatsetu.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    phone TEXT UNIQUE,
    village TEXT,
    medical_history TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    specialization TEXT,
    available INTEGER DEFAULT 1,
    phone TEXT UNIQUE,
    experience_years INTEGER DEFAULT 1,
    rating REAL DEFAULT 4.5,
    status TEXT DEFAULT 'offline' CHECK(status IN ('online','offline','busy')),
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS pharmacies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    village TEXT NOT NULL,
    distance_km REAL NOT NULL,
    phone TEXT,
    available INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name)
  );

  CREATE TABLE IF NOT EXISTS villages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    distance_km REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name)
  );

  CREATE TABLE IF NOT EXISTS consultations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    symptoms TEXT,
    ai_triage_level TEXT,
    ai_explanation TEXT,
    ai_action TEXT,
    ai_remedies TEXT,
    ai_warning TEXT,
    doctor_id INTEGER,
    doctor_notes TEXT,
    prescription TEXT,
    status TEXT DEFAULT 'pending',
    priority_score INTEGER DEFAULT 0,
    symptom_check_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    FOREIGN KEY (symptom_check_id) REFERENCES symptom_checks(id)
  );

  CREATE TABLE IF NOT EXISTS medicines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    pharmacy_name TEXT,
    village TEXT,
    distance_km REAL,
    available INTEGER DEFAULT 1,
    stock_count INTEGER DEFAULT 0,
    price INTEGER,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    appointment_date TEXT NOT NULL,
    appointment_time TEXT NOT NULL,
    reason TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'completed', 'cancelled')),
    notes TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    user_type TEXT NOT NULL CHECK(user_type IN ('patient', 'doctor')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS call_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    doctor_id INTEGER,
    mode TEXT CHECK(mode IN ('audio', 'video')),
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'completed', 'cancelled')),
    meeting_code TEXT,
    notes TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
  );

  CREATE TABLE IF NOT EXISTS symptom_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    symptoms TEXT NOT NULL,
    possible_condition TEXT,
    risk_level TEXT CHECK(risk_level IN ('LOW','MEDIUM','HIGH')),
    recommendation TEXT,
    explanation TEXT,
    matched_symptoms TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  );
`);

// Simple migration logic for existing tables
try {
  db.prepare("ALTER TABLE doctors ADD COLUMN experience_years INTEGER DEFAULT 1").run();
} catch (e) {}

try {
  db.prepare("ALTER TABLE doctors ADD COLUMN rating REAL DEFAULT 4.5").run();
} catch (e) {}

try {
  db.prepare("ALTER TABLE doctors ADD COLUMN status TEXT DEFAULT 'offline'").run();
} catch (e) {}

try {
  db.prepare("ALTER TABLE doctors ADD COLUMN last_seen DATETIME DEFAULT CURRENT_TIMESTAMP").run();
} catch (e) {}

try {
  db.prepare("ALTER TABLE consultations ADD COLUMN symptom_check_id INTEGER").run();
} catch (e) {
  // Column likely already exists
}

console.log('✅ Database ready');

module.exports = db;
