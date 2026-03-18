import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import useBlockZoom from './utils/useBlockZoom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import OrderPage from './pages/OrderPage';
import ConfirmationPage from './pages/ConfirmationPage';
import TrackPage from './pages/TrackPage';
import OwnerDashboard from './pages/OwnerDashboard';
import QRPosterPage from './pages/QRPosterPage';
import SettingsPage from './pages/SettingsPage';
import PortfolioPage from './pages/PortfolioPage';
import ManagePortfolioPage from './pages/ManagePortfolioPage';
import DataManagerPage from './pages/DataManagerPage';
import CalendarPage from './pages/CalendarPage';
import AboutPage from './pages/AboutPage';
import ManageAboutPage from './pages/ManageAboutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './styles/global.css';

// Inner component so hook runs inside AuthProvider/BrowserRouter
function AppInner() {
  useBlockZoom(); // ← blocks all zoom everywhere
  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: { background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', fontFamily: 'var(--font-body)' },
        success: { iconTheme: { primary: 'var(--success)', secondary: 'var(--black)' } },
        error:   { iconTheme: { primary: 'var(--danger)',  secondary: '#fff' } },
      }} />
      <Navbar />
      <Routes>
        <Route path="/"                      element={<HomePage />} />
        <Route path="/order"                 element={<OrderPage />} />
        <Route path="/confirmation/:orderId" element={<ConfirmationPage />} />
        <Route path="/track"                 element={<TrackPage />} />
        <Route path="/track/:orderId"        element={<TrackPage />} />
        <Route path="/portfolio"             element={<PortfolioPage />} />
        <Route path="/calendar"              element={<CalendarPage />} />
        <Route path="/about"                 element={<AboutPage />} />
        <Route path="/owner/dashboard"       element={<OwnerDashboard />} />
        <Route path="/owner/data"            element={<DataManagerPage />} />
        <Route path="/owner/portfolio"       element={<ManagePortfolioPage />} />
        <Route path="/owner/about"           element={<ManageAboutPage />} />
        <Route path="/owner/calendar"        element={<CalendarPage />} />
        <Route path="/owner/qr-poster"       element={<QRPosterPage />} />
        <Route path="/owner/settings"        element={<SettingsPage />} />
        <Route path="/login"                 element={<LoginPage />} />
        <Route path="/register"              element={<RegisterPage />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </AuthProvider>
  );
}