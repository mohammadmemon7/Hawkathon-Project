require('dotenv').config();
const express = require('express');
const cors = require('cors');

require('./db/database');
const { runSeed } = require('./db/seed');
runSeed();

const patientRoutes = require('./routes/patients');
const doctorRoutes = require('./routes/doctors');
const consultationRoutes = require('./routes/consultations');
const medicineRoutes = require('./routes/medicines');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SehatSetu API running' });
});

app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/medicines', medicineRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 SehatSetu API running on port ${PORT}`);
});
