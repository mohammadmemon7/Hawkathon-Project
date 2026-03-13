import { lazy, Suspense, useState, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, AppContext } from './context/AppContext';
import OfflineBanner from './components/OfflineBanner';
import DashboardLayout from './components/DashboardLayout';
import LoadingSpinner from './components/LoadingSpinner';

const Home = lazy(() => import('./pages/Home'));
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
const PatientLogin = lazy(() => import('./pages/PatientLogin'));

function ProtectedPatientRoute({ children }) {
  const { currentPatient } = useContext(AppContext);
  if (!currentPatient) {
    return <Navigate to="/register" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AppProvider>
      <OfflineBanner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public/Auth Routes without Dashboard Layout */}
            <Route path="/register" element={<PatientRegister />} />
            <Route path="/login" element={<PatientLogin />} />
            <Route path="/doctor-login" element={<DoctorLogin />} />
            <Route path="/dashboard" element={<DoctorDashboard />} />

            {/* Patient Routes with Dashboard Layout */}
            <Route path="/" element={<DashboardLayout><Home /></DashboardLayout>} />
            <Route path="/symptoms" element={<ProtectedPatientRoute><DashboardLayout><SymptomChecker /></DashboardLayout></ProtectedPatientRoute>} />
            <Route path="/result" element={<ProtectedPatientRoute><DashboardLayout><TriageResult /></DashboardLayout></ProtectedPatientRoute>} />
            <Route path="/talk" element={<ProtectedPatientRoute><DashboardLayout><TalkToDoctor /></DashboardLayout></ProtectedPatientRoute>} />
            <Route path="/book-appointment" element={<ProtectedPatientRoute><DashboardLayout><BookAppointment /></DashboardLayout></ProtectedPatientRoute>} />
            <Route path="/consultation/:id" element={<ProtectedPatientRoute><DashboardLayout><ConsultationDetail /></DashboardLayout></ProtectedPatientRoute>} />
            <Route path="/medicines" element={<ProtectedPatientRoute><DashboardLayout><MedicineFinder /></DashboardLayout></ProtectedPatientRoute>} />
            <Route path="/profile/:id" element={<ProtectedPatientRoute><DashboardLayout><PatientProfile /></DashboardLayout></ProtectedPatientRoute>} />
            <Route path="/records" element={<ProtectedPatientRoute><DashboardLayout><MyRecords /></DashboardLayout></ProtectedPatientRoute>} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProvider>
  );
}
