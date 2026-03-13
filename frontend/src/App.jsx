import { lazy, Suspense, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, AppContext } from './context/AppContext';
import OfflineBanner from './components/OfflineBanner';
import DashboardLayout from './components/DashboardLayout';
import DoctorDashboardLayout from './components/DoctorDashboardLayout';
import LoadingSpinner from './components/LoadingSpinner';

const Home = lazy(() => import('./pages/Home'));
const PatientLogin = lazy(() => import('./pages/PatientLogin'));
const PatientRegister = lazy(() => import('./pages/PatientRegister'));
const SymptomChecker = lazy(() => import('./pages/SymptomChecker'));
const TriageResult = lazy(() => import('./pages/TriageResult'));
const DoctorLogin = lazy(() => import('./pages/DoctorLogin'));
const DoctorDashboard = lazy(() => import('./pages/DoctorDashboard'));
const ConsultationDetail = lazy(() => import('./pages/ConsultationDetail'));
const TalkToDoctor = lazy(() => import('./pages/TalkToDoctor'));
const MedicineFinder = lazy(() => import('./pages/MedicineFinder'));
const PatientProfile = lazy(() => import('./pages/PatientProfile'));
const MyRecords = lazy(() => import('./pages/MyRecords'));
const BookAppointment = lazy(() => import('./pages/BookAppointment'));
const DoctorAppointments = lazy(() => import('./pages/DoctorAppointments'));
const MedicineAdmin = lazy(() => import('./pages/MedicineAdmin'));
const SymptomResult = lazy(() => import('./pages/SymptomResult'));
const DoctorDirectory = lazy(() => import('./pages/DoctorDirectory'));

function RequirePatient({ children }) {
  const { patient } = useContext(AppContext);
  if (!patient) return <Navigate to="/login" replace />;
  return children;
}

function RequireDoctor({ children }) {
  const { currentDoctor } = useContext(AppContext);
  if (!currentDoctor) return <Navigate to="/doctor-login" replace />;
  return children;
}

export default function App() {
  return (
    <AppProvider>
      <OfflineBanner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* AUTH ROUTES */}
            <Route path="/register" element={<PatientRegister />} />
            <Route path="/login" element={<PatientLogin />} />
            <Route path="/doctor-login" element={<DoctorLogin />} />

            {/* DOCTOR ROUTES */}
            <Route path="/dashboard" element={<RequireDoctor><DoctorDashboardLayout><DoctorDashboard /></DoctorDashboardLayout></RequireDoctor>} />
            <Route path="/doctor-appointments" element={<RequireDoctor><DoctorDashboardLayout><DoctorAppointments /></DoctorDashboardLayout></RequireDoctor>} />
            <Route path="/medicine-admin" element={<RequireDoctor><DoctorDashboardLayout><MedicineAdmin /></DoctorDashboardLayout></RequireDoctor>} />

            {/* PATIENT ROUTES */}
            <Route path="/" element={<RequirePatient><DashboardLayout><Home /></DashboardLayout></RequirePatient>} />
            <Route path="/symptoms" element={<RequirePatient><DashboardLayout><SymptomChecker /></DashboardLayout></RequirePatient>} />
            <Route path="/result" element={<RequirePatient><DashboardLayout><TriageResult /></DashboardLayout></RequirePatient>} />
            <Route path="/symptom-result" element={<RequirePatient><DashboardLayout><SymptomResult /></DashboardLayout></RequirePatient>} />
            <Route path="/doctors" element={<RequirePatient><DashboardLayout><DoctorDirectory /></DashboardLayout></RequirePatient>} />
            <Route path="/talk" element={<RequirePatient><DashboardLayout><TalkToDoctor /></DashboardLayout></RequirePatient>} />
            <Route path="/book-appointment" element={<RequirePatient><DashboardLayout><BookAppointment /></DashboardLayout></RequirePatient>} />
            <Route path="/consultation/:id" element={<RequirePatient><DashboardLayout><ConsultationDetail /></DashboardLayout></RequirePatient>} />
            <Route path="/medicines" element={<RequirePatient><DashboardLayout><MedicineFinder /></DashboardLayout></RequirePatient>} />
            <Route path="/profile/:id" element={<RequirePatient><DashboardLayout><PatientProfile /></DashboardLayout></RequirePatient>} />
            <Route path="/records" element={<RequirePatient><DashboardLayout><MyRecords /></DashboardLayout></RequirePatient>} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProvider>
  );
}
