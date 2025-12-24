import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Problems from './pages/Problems';
import Profile from './pages/Profile';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/problems"
            element={
              // <ProtectedRoute>
                <Problems />
              // </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              // <ProtectedRoute>
                <Profile />
              // {/* </ProtectedRoute> */}
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
