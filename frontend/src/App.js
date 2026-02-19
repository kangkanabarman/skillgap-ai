import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import UploadResume from "./pages/UploadResume";
import SkillAnalysis from "./pages/SkillAnalysis";
import CareerTest from "./pages/CareerTest";
import CareerResults from "./pages/CareerResults";
import ProfilePage from "./pages/ProfilePage";
import JobNews from "./pages/JobNews";
import DSATracker from "./pages/DSATracker";
import { Toaster } from "@/components/ui/sonner";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/auth" />;
  };

  return (
    <div className="App min-h-screen bg-background">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/upload-resume" element={<ProtectedRoute><UploadResume /></ProtectedRoute>} />
          <Route path="/skill-analysis" element={<ProtectedRoute><SkillAnalysis /></ProtectedRoute>} />
          <Route path="/career-test" element={<ProtectedRoute><CareerTest /></ProtectedRoute>} />
          <Route path="/career-results" element={<ProtectedRoute><CareerResults /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/news" element={<JobNews />} />
          <Route path="/dsa-tracker" element={<DSATracker />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
