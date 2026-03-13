import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
});

async function withRetry(requestFn) {
  try {
    return await requestFn();
  } catch (err) {
    // Retry once on network errors or 5xx responses
    const isNetworkError = !err.response;
    const isServerError = err.response?.status >= 500;
      
    if (isNetworkError || isServerError) {
      console.warn("Network error encountered on request, retrying in 2 seconds...");
      return new Promise((resolve, reject) => {
         setTimeout(async () => {
             try {
                 const result = await requestFn();
                 resolve(result);
             } catch (retryErr) {
                 reject(retryErr);
             }
         }, 2000);
      });
    }
      
    throw err;
  }
}

export async function registerPatient(data) {
  try {
    const res = await withRetry(() => api.post('/patients/register', data));
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function getPatientByPhone(phone) {
  try {
    const res = await withRetry(() => api.get(`/patients/${phone}`));
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function getPatientHistory(id) {
  try {
    const res = await withRetry(() => api.get(`/patients/${id}/history`));
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function getDoctors(page = 1, limit = 10) {
  try {
    const res = await withRetry(() => api.get('/doctors', { params: { page, limit } }));
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function getAvailableDoctors() {
  try {
    const res = await withRetry(() => api.get('/doctors/available'));
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function createConsultation(data) {
  try {
    const res = await withRetry(() => api.post('/consultations/new', data));
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function getPendingConsultations(page = 1, limit = 10) {
  try {
    const res = await withRetry(() => api.get('/consultations/pending', { params: { page, limit } }));
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function getConsultation(id) {
  try {
    const res = await withRetry(() => api.get(`/consultations/${id}`));
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function updateConsultation(id, data) {
  try {
    const res = await withRetry(() => api.patch(`/consultations/${id}`, data));
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function completeConsultation(id, doctorId) {
  try {
    const res = await withRetry(() => api.patch(`/consultations/${id}/complete`, { doctor_id: doctorId }));
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function searchMedicines(name) {
  try {
    const res = await withRetry(() => api.get('/medicines/search', { params: { name } }));
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function getAllMedicines(page = 1, limit = 100) {
  try {
    const res = await withRetry(() => api.get('/medicines/all', { params: { page, limit } }));
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function getMedicineLastUpdated() {
  try {
    const res = await withRetry(() => api.get('/medicines/last-updated'));
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function updateMedicine(id, data) {
  try {
    const res = await withRetry(() => api.patch(`/medicines/${id}`, data));
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function createAppointment(data) {
  try {
    const res = await withRetry(() => api.post('/appointments', data));
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function getPatientAppointments(id) {
  try {
    const res = await withRetry(() => api.get(`/appointments/patient/${id}`));
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function getDoctorAppointments(id) {
  try {
    const res = await withRetry(() => api.get(`/appointments/doctor/${id}`));
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function cancelAppointment(id) {
  try {
    const res = await withRetry(() => api.patch(`/appointments/${id}/cancel`));
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function getNotifications(userId, userType) {
  try {
    const res = await withRetry(() => api.get(`/notifications/${userId}`, {
      params: userType ? { userType } : undefined,
    }));
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function markNotificationRead(id) {
  try {
    const res = await withRetry(() => api.patch(`/notifications/${id}/read`));
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function requestCall(data) {
  try {
    const res = await withRetry(() => api.post('/calls/request', data));
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function cancelCall(id) {
  try {
    const res = await withRetry(() => api.patch(`/calls/${id}/cancel`));
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function getPatientCalls(patientId) {
  try {
    const res = await withRetry(() => api.get(`/calls/patient/${patientId}`));
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function getPendingCalls() {
  try {
    const res = await withRetry(() => api.get('/calls/pending'));
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function acceptCall(id) {
  try {
    const res = await withRetry(() => api.patch(`/calls/${id}/accept`));
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function completeCall(id) {
  try {
    const res = await withRetry(() => api.patch(`/calls/${id}/complete`));
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function toggleDoctorAvailability(id) {
  try {
    const res = await withRetry(() => api.patch(`/doctors/${id}/toggle`));
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function getDoctorDirectory(params) {
  try {
    const res = await withRetry(() => api.get('/doctor-directory', { params }));
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function updateDoctorStatus(id, status) {
  try {
    const res = await withRetry(() => api.patch(`/doctors/${id}/status`, { status }));
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function analyzeSymptomsLite(data) {
  try {
    const res = await withRetry(() => api.post('/symptom-checker/analyze', data));
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}
