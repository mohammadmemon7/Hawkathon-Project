import { lazy, Suspense, useContext, useState } from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppContext } from './context/AppContext';
import OfflineBanner from './components/OfflineBanner';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
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

function RequirePatient({ children }) {
  const { patient, currentDoctor } = useContext(AppContext);

  if (currentDoctor) return children;
  if (!patient) return <Navigate to="/register" replace />;

  return children;
}

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AppProvider>
      <OfflineBanner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="flex h-screen bg-gray-50 overflow-hidden text-[var(--text)]">
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <TopHeader onMenuClick={() => setIsSidebarOpen(true)} />
            
            <main className="flex-1 overflow-y-auto bg-gray-50/30">
              <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<RequirePatient><Home /></RequirePatient>} />
                <Route path="/login" element={<PatientLogin />} />
                <Route path="/register" element={<PatientRegister />} />
                <Route path="/symptoms" element={<RequirePatient><SymptomChecker /></RequirePatient>} />
                <Route path="/result" element={<RequirePatient><TriageResult /></RequirePatient>} />
                <Route path="/doctor-login" element={<DoctorLogin />} />
                <Route path="/dashboard" element={<DoctorDashboard />} />
                <Route path="/talk" element={<RequirePatient><TalkToDoctor /></RequirePatient>} />
                <Route path="/book-appointment" element={<RequirePatient><BookAppointment /></RequirePatient>} />
                <Route path="/consultation/:id" element={<ConsultationDetail />} />
                <Route path="/medicines" element={<RequirePatient><MedicineFinder /></RequirePatient>} />
                <Route path="/profile/:id" element={<RequirePatient><PatientProfile /></RequirePatient>} />
                <Route path="/records" element={<RequirePatient><MyRecords /></RequirePatient>} />
              </Routes>
              </Suspense>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
