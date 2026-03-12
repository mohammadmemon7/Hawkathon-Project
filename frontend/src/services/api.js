import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export async function registerPatient(data) {
  try {
    const res = await api.post('/patients/register', data);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function getPatientByPhone(phone) {
  try {
    const res = await api.get(`/patients/${phone}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function getPatientHistory(id) {
  try {
    const res = await api.get(`/patients/${id}/history`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function getDoctors() {
  try {
    const res = await api.get('/doctors');
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function getAvailableDoctors() {
  try {
    const res = await api.get('/doctors/available');
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function createConsultation(data) {
  try {
    const res = await api.post('/consultations/new', data);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function getPendingConsultations() {
  try {
    const res = await api.get('/consultations/pending');
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function getConsultation(id) {
  try {
    const res = await api.get(`/consultations/${id}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function updateConsultation(id, data) {
  try {
    const res = await api.patch(`/consultations/${id}`, data);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function completeConsultation(id, doctorId) {
  try {
    const res = await api.patch(`/consultations/${id}/complete`, { doctor_id: doctorId });
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function searchMedicines(name) {
  try {
    const res = await api.get('/medicines/search', { params: { name } });
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}
