import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PatientRegister from './pages/PatientRegister';
import SymptomChecker from './pages/SymptomChecker';
import TriageResult from './pages/TriageResult';
import DoctorLogin from './pages/DoctorLogin';
import DoctorDashboard from './pages/DoctorDashboard';
import ConsultationDetail from './pages/ConsultationDetail';
import MedicineFinder from './pages/MedicineFinder';
import PatientProfile from './pages/PatientProfile';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<PatientRegister />} />
          <Route path="/symptoms" element={<SymptomChecker />} />
          <Route path="/result" element={<TriageResult />} />
          <Route path="/doctor-login" element={<DoctorLogin />} />
          <Route path="/dashboard" element={<DoctorDashboard />} />
          <Route path="/consultation/:id" element={<ConsultationDetail />} />
          <Route path="/medicines" element={<MedicineFinder />} />
          <Route path="/profile/:id" element={<PatientProfile />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
