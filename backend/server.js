require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');

require('./db/database');
const { runSeed } = require('./db/seed');
runSeed();

const patientRoutes = require('./routes/patients');
const doctorRoutes = require('./routes/doctors');
const consultationRoutes = require('./routes/consultations');
const medicineRoutes = require('./routes/medicines');
const appointmentRoutes = require('./routes/appointments');
const notificationRoutes = require('./routes/notifications');
const callRoutes = require('./routes/calls');
const symptomCheckerRoutes = require('./routes/symptomChecker');
const doctorDirectoryRoutes = require('./routes/doctorDirectory');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(compression());
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.json({ status: 'ok', message: 'SehatSetu API running' });
});

app.get('/api/health/bandwidth', (req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.json({ compressed: true, timestamp: Date.now() });
});

app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/symptom-checker', symptomCheckerRoutes);
app.use('/api/doctor-directory', doctorDirectoryRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 SehatSetu API running on port ${PORT}`);
});
