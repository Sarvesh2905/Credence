import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import AssessmentPage from './pages/AssessmentPage';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner spinner-lg" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Guest Route wrapper (redirect if already logged in)
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner spinner-lg" />
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to={user?.isOnboarded ? '/dashboard' : '/onboarding'} replace />;
  }
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#111827',
              color: '#f0f4ff',
              border: '1px solid #1e293b',
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#00ff88', secondary: '#111827' },
            },
            error: {
              iconTheme: { primary: '#ff4757', secondary: '#111827' },
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Guest Routes */}
          <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          
          {/* Protected Routes */}
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/assessment/:id" element={<ProtectedRoute><AssessmentPage /></ProtectedRoute>} />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
