const db = require('./database');

function runSeed() {
  const insertDoctor = db.prepare(
    `INSERT OR IGNORE INTO doctors (name, specialization, available, phone) VALUES (?, ?, ?, ?)`
  );

  const doctors = [
    ['Dr. Rajinder Singh', 'General Physician', 1, '9876500001'],
    ['Dr. Priya Sharma', 'Pediatrician', 1, '9876500002'],
    ['Dr. Harpreet Kaur', 'Gynecologist', 0, '9876500003'],
    ['Dr. Amarjit Brar', 'General Physician', 1, '9876500004'],
  ];

  const insertMany = db.transaction((rows) => {
    for (const row of rows) insertDoctor.run(...row);
  });
  insertMany(doctors);
  console.log('✅ Doctors seeded');

  const insertMedicine = db.prepare(
    `INSERT OR IGNORE INTO medicines (name, pharmacy_name, village, distance_km, available, stock_count, price) VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  const medicines = [
    ['Paracetamol',   'Nabha Medical Store', 'Nabha',        1.2, 1, 45,  12],
    ['Paracetamol',   'Singh Pharmacy',      'Sirhind Road', 2.5, 1, 20,  10],
    ['Amoxicillin',   'City Medical Nabha',  'Nabha',        0.8, 1, 15,  85],
    ['Metformin',     'Nabha Medical Store', 'Nabha',        1.2, 0, 0,   45],
    ['Metformin',     'Sharma Dawakhana',    'Fatehgarh',    8.3, 1, 8,   40],
    ['ORS Packet',    'Singh Pharmacy',      'Sirhind Road', 2.5, 1, 100, 5],
    ['Azithromycin',  'City Medical Nabha',  'Nabha',        0.8, 1, 6,   120],
    ['Ibuprofen',     'Nabha Medical Store', 'Nabha',        1.2, 1, 30,  18],
    ['Cetirizine',    'Singh Pharmacy',      'Sirhind Road', 2.5, 1, 50,  8],
    ['Pantoprazole',  'City Medical Nabha',  'Nabha',        0.8, 1, 22,  35],
  ];

  const insertManyMeds = db.transaction((rows) => {
    for (const row of rows) insertMedicine.run(...row);
  });
  insertManyMeds(medicines);
  console.log('✅ Medicines seeded');
}

if (require.main === module) {
  runSeed();
}

module.exports = { runSeed };
