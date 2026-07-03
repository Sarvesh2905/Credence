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
              background: '#FFFFFF',
              color: '#111111',
              border: '1px solid #E2E2E2',
              borderRadius: '8px',
              fontSize: '13px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            },
            success: {
              iconTheme: { primary: '#2A6B4A', secondary: '#FFFFFF' },
            },
            error: {
              iconTheme: { primary: '#B83232', secondary: '#FFFFFF' },
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
