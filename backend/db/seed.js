const db = require('./database');

const doctors = [
  ['Dr. Gurpreet Singh Dhillon', 'General Physician', 1, '9876501001'],
  ['Dr. Manpreet Kaur Brar', 'Pediatrician', 1, '9876501002'],
  ['Dr. Jasleen Kaur Sidhu', 'Gynecologist', 1, '9876501003'],
  ['Dr. Harinderpal Singh Sekhon', 'Orthopedic Surgeon', 1, '9876501004'],
  ['Dr. Sandeep Singh Bawa', 'ENT Specialist', 0, '9876501005'],
  ['Dr. Rupinder Kaur Gill', 'Dermatologist', 1, '9876501006'],
  ['Dr. Navdeep Singh Aulakh', 'Ophthalmologist', 1, '9876501007'],
  ['Dr. Baljit Singh Sekhon', 'General Physician', 1, '9876501008'],
  ['Dr. Simranjit Kaur Chahal', 'General Surgeon', 0, '9876501009'],
  ['Dr. Hardeep Singh Mann', 'Emergency Medical Officer', 1, '9876501010'],
  ['Dr. Amarpreet Kaur Sandhu', 'Anesthetist', 1, '9876501011'],
];

const pharmacies = [
  ['Nabha City Medicos', 'Nabha', 1.1, '9876602101', 1],
  ['Amloh Care Pharmacy', 'Amloh', 18.4, '9876602102', 1],
  ['Bhadson Sehat Medicos', 'Bhadson', 11.6, '9876602103', 1],
  ['Patiala Road LifeCare Pharmacy', 'Patiala Road', 4.2, '9876602104', 1],
];

const villages = [
  ['Nabha', 1.0],
  ['Bhadson', 11.5],
  ['Rohti Chhanna', 8.2],
  ['Thuhi', 10.4],
  ['Kheri Jattan', 6.8],
  ['Dhanauri', 7.9],
  ['Binaheri', 9.1],
  ['Chaswal', 13.0],
  ['Simbro', 14.2],
  ['Mandaur', 12.7],
  ['Dhingi', 15.4],
  ['Ghanurki', 9.8],
  ['Kaidupur', 6.1],
  ['Ramgarh', 5.7],
  ['Akalgarh', 7.3],
  ['Lohar Majra', 12.1],
  ['Pedni Khurd', 16.0],
  ['Pedni Kalan', 17.4],
  ['Mehargarh Batti', 7.4],
  ['Harigarh Gehlan', 17.2],
];

const medicines = [
  ['Paracetamol 650mg', 'Nabha City Medicos', 'Nabha', 1.1, 1, 120, 25],
  ['Ibuprofen 400mg', 'Nabha City Medicos', 'Nabha', 1.1, 1, 80, 32],
  ['Diclofenac Gel', 'Nabha City Medicos', 'Nabha', 1.1, 1, 35, 95],
  ['Amoxicillin 500mg', 'Nabha City Medicos', 'Nabha', 1.1, 1, 42, 88],
  ['Azithromycin 500mg', 'Nabha City Medicos', 'Nabha', 1.1, 1, 26, 118],
  ['ORS Sachet', 'Nabha City Medicos', 'Nabha', 1.1, 1, 240, 22],
  ['Zinc 20mg', 'Nabha City Medicos', 'Nabha', 1.1, 1, 110, 28],
  ['Cetirizine 10mg', 'Nabha City Medicos', 'Nabha', 1.1, 1, 100, 18],
  ['Pantoprazole 40mg', 'Nabha City Medicos', 'Nabha', 1.1, 1, 70, 65],
  ['Metformin 500mg', 'Patiala Road LifeCare Pharmacy', 'Patiala Road', 4.2, 1, 95, 42],
  ['Glibenclamide 5mg', 'Patiala Road LifeCare Pharmacy', 'Patiala Road', 4.2, 1, 40, 36],
  ['Amlodipine 5mg', 'Patiala Road LifeCare Pharmacy', 'Patiala Road', 4.2, 1, 75, 38],
  ['Telmisartan 40mg', 'Patiala Road LifeCare Pharmacy', 'Patiala Road', 4.2, 1, 60, 92],
  ['Antacid Suspension', 'Patiala Road LifeCare Pharmacy', 'Patiala Road', 4.2, 1, 34, 78],
  ['Cough Syrup', 'Bhadson Sehat Medicos', 'Bhadson', 11.6, 1, 55, 72],
  ['Ambroxol Syrup', 'Bhadson Sehat Medicos', 'Bhadson', 11.6, 1, 36, 68],
  ['Albendazole 400mg', 'Bhadson Sehat Medicos', 'Bhadson', 11.6, 1, 48, 24],
  ['Iron Folic Acid Tablets', 'Bhadson Sehat Medicos', 'Bhadson', 11.6, 1, 90, 30],
  ['Calcium + Vitamin D3', 'Bhadson Sehat Medicos', 'Bhadson', 11.6, 1, 64, 110],
  ['Salbutamol Inhaler', 'Bhadson Sehat Medicos', 'Bhadson', 11.6, 1, 18, 165],
  ['Cefixime 200mg', 'Amloh Care Pharmacy', 'Amloh', 18.4, 1, 32, 125],
  ['Artesunate-SP', 'Amloh Care Pharmacy', 'Amloh', 18.4, 1, 20, 145],
  ['Chloroquine Phosphate', 'Amloh Care Pharmacy', 'Amloh', 18.4, 1, 22, 52],
  ['Mupirocin Ointment', 'Amloh Care Pharmacy', 'Amloh', 18.4, 1, 28, 96],
  ['Ofloxacin Eye Drops', 'Amloh Care Pharmacy', 'Amloh', 18.4, 1, 24, 84],
  ['ORS Sachet', 'Patiala Road LifeCare Pharmacy', 'Patiala Road', 4.2, 1, 180, 20],
  ['Paracetamol 650mg', 'Bhadson Sehat Medicos', 'Bhadson', 11.6, 1, 96, 24],
  ['Metformin 500mg', 'Amloh Care Pharmacy', 'Amloh', 18.4, 1, 58, 44],
];

function upsertDoctors() {
  const findDoctor = db.prepare('SELECT id FROM doctors WHERE phone = ?');
  const insertDoctor = db.prepare(
    'INSERT OR IGNORE INTO doctors (name, specialization, available, phone, experience_years, rating, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const updateDoctor = db.prepare(
    'UPDATE doctors SET name = ?, specialization = ?, available = ?, experience_years = ?, rating = ?, status = ? WHERE id = ?'
  );

  const transaction = db.transaction((rows) => {
    for (const [name, specialization, available, phone, exp, rating, status] of rows) {
      const existing = findDoctor.get(phone);
      if (existing) {
        updateDoctor.run(name, specialization, available, exp, rating, status, existing.id);
      } else {
        insertDoctor.run(name, specialization, available, phone, exp, rating, status);
      }
    }
  });

  transaction(doctors);

  const seededPhones = doctors.map((d) => d[3]);
  const placeholders = seededPhones.map(() => '?').join(', ');
  db.prepare(
    `DELETE FROM doctors
     WHERE phone NOT IN (${placeholders})
       AND id NOT IN (
         SELECT doctor_id FROM consultations WHERE doctor_id IS NOT NULL
         UNION
         SELECT doctor_id FROM appointments WHERE doctor_id IS NOT NULL
       )`
  ).run(...seededPhones);

  console.log(`✅ Doctors seeded (${doctors.length})`);
}

function upsertPharmacies() {
  const clearPharmacies = db.prepare('DELETE FROM pharmacies');
  const insertPharmacy = db.prepare(
    'INSERT INTO pharmacies (name, village, distance_km, phone, available) VALUES (?, ?, ?, ?, ?)'
  );

  const transaction = db.transaction((rows) => {
    clearPharmacies.run();
    for (const [name, village, distanceKm, phone, available] of rows) {
      insertPharmacy.run(name, village, distanceKm, phone, available);
    }
  });

  transaction(pharmacies);
  console.log(`✅ Pharmacies seeded (${pharmacies.length})`);
}

function upsertVillages() {
  const clearVillages = db.prepare('DELETE FROM villages');
  const insertVillage = db.prepare('INSERT INTO villages (name, distance_km) VALUES (?, ?)');

  const transaction = db.transaction((rows) => {
    clearVillages.run();
    for (const [name, distanceKm] of rows) {
      insertVillage.run(name, distanceKm);
    }
  });

  transaction(villages);
  console.log(`✅ Villages seeded (${villages.length})`);
}

function upsertMedicines() {
  const clearMedicines = db.prepare('DELETE FROM medicines');
  const insertMedicine = db.prepare(
    'INSERT INTO medicines (name, pharmacy_name, village, distance_km, available, stock_count, price) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  const transaction = db.transaction((rows) => {
    clearMedicines.run();
    for (const [name, pharmacyName, village, distanceKm, available, stockCount, price] of rows) {
      insertMedicine.run(name, pharmacyName, village, distanceKm, available, stockCount, price);
    }
  });

  transaction(medicines);
  console.log(`✅ Medicines seeded (${medicines.length})`);
}

function runSeed() {
  upsertDoctors();
  upsertPharmacies();
  upsertVillages();
  upsertMedicines();
}

if (require.main === module) {
  runSeed();
}

module.exports = { runSeed };
