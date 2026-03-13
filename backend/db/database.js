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

  CREATE TABLE IF NOT EXISTS medicine_feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    medicine_id INTEGER NOT NULL,
    patient_id INTEGER,
    reported_available INTEGER NOT NULL,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(medicine_id) REFERENCES medicines(id),
    FOREIGN KEY(patient_id) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS village_health_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    village TEXT NOT NULL,
    disease TEXT NOT NULL,
    case_count INTEGER DEFAULT 1,
    reported_by TEXT DEFAULT 'system',
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS health_workers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    worker_id_code TEXT UNIQUE NOT NULL,
    village TEXT NOT NULL,
    phone TEXT,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS patient_vitals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    worker_id INTEGER NOT NULL,
    temperature REAL,
    bp_sys INTEGER,
    bp_dia INTEGER,
    pulse INTEGER,
    spo2 INTEGER,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(patient_id) REFERENCES patients(id),
    FOREIGN KEY(worker_id) REFERENCES health_workers(id)
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

  CREATE TABLE IF NOT EXISTS consultation_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    mode TEXT NOT NULL CHECK(mode IN ('chat','audio','video')),
    status TEXT DEFAULT 'requested' CHECK(status IN ('requested','accepted','active','completed','cancelled')),
    meeting_code TEXT,
    started_at DATETIME,
    ended_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(patient_id) REFERENCES patients(id),
    FOREIGN KEY(doctor_id) REFERENCES doctors(id)
  );

  CREATE TABLE IF NOT EXISTS consultation_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    sender_type TEXT NOT NULL CHECK(sender_type IN ('patient','doctor')),
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(session_id) REFERENCES consultation_sessions(id)
  );

  CREATE TABLE IF NOT EXISTS prescriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    medicines TEXT,            -- JSON string array
    instructions TEXT,
    follow_up TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(session_id) REFERENCES consultation_sessions(id)
  );
  CREATE TABLE IF NOT EXISTS health_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    session_id INTEGER,                 -- telemed session id (nullable)
    diagnosis TEXT,
    consultation_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(patient_id) REFERENCES patients(id),
    FOREIGN KEY(doctor_id) REFERENCES doctors(id)
  );

  CREATE TABLE IF NOT EXISTS health_record_prescriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id INTEGER NOT NULL,
    medicines TEXT,                     -- JSON array of strings
    instructions TEXT,
    follow_up TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(record_id) REFERENCES health_records(id)
  );

  CREATE TABLE IF NOT EXISTS lab_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id INTEGER NOT NULL,
    file_name TEXT,
    file_type TEXT,
    file_url TEXT,                      -- for prototype: local path or placeholder
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(record_id) REFERENCES health_records(id)
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
