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
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
      </Routes>
    </Router>
  );
}

export default App;
