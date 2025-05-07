import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Welcome from './components/Welcome';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/dashboard/Dashboard';
import PluginDetail from './components/dashboard/sections/PluginDetail';
import CreatePipeline from './pages/CreatePipeline';
import ManageCredentials from './pages/ManageCredentials';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  // If either token or user is missing, redirect to login
  if (!token || !user) {
    // Clear any existing auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Component (for login/register when already authenticated)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  // If both token and user exist, redirect to dashboard
  if (token && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/plugins/:id" 
          element={
            <ProtectedRoute>
              <PluginDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create-pipeline" 
          element={
            <ProtectedRoute>
              <CreatePipeline />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/manage-credentials"
          element={
            <ProtectedRoute>
              <ManageCredentials />
            </ProtectedRoute>
          }
        />
        {/* Catch all route - redirect to welcome page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
