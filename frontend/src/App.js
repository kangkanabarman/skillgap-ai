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
import FindJobs from "./pages/FindJobs";
import ApplicationsPage from "./pages/ApplicationsPage";
import RecruiterJobs from "./pages/RecruiterJobs";
import RecruiterJobForm from "./pages/RecruiterJobForm";
import RecruiterApplicants from "./pages/RecruiterApplicants";
import RecruiterAnalytics from "./pages/RecruiterAnalytics";
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
  const RoleRoute = ({ children, allowed }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') || 'student';
    if (!token) return <Navigate to="/auth" />;
    return allowed.includes(role) ? children : <Navigate to="/dashboard" />;
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
          <Route path="/find-jobs" element={<RoleRoute allowed={["student"]}><FindJobs /></RoleRoute>} />
          <Route path="/applications" element={<RoleRoute allowed={["student"]}><ApplicationsPage /></RoleRoute>} />
          <Route path="/recruiter/jobs" element={<RoleRoute allowed={["recruiter"]}><RecruiterJobs /></RoleRoute>} />
          <Route path="/recruiter/create-job" element={<RoleRoute allowed={["recruiter"]}><RecruiterJobForm /></RoleRoute>} />
          <Route path="/recruiter/edit-job/:jobId" element={<RoleRoute allowed={["recruiter"]}><RecruiterJobForm edit /></RoleRoute>} />
          <Route path="/recruiter/jobs/:jobId/applicants" element={<RoleRoute allowed={["recruiter"]}><RecruiterApplicants /></RoleRoute>} />
          <Route path="/recruiter/analytics" element={<RoleRoute allowed={["recruiter"]}><RecruiterAnalytics /></RoleRoute>} />
          <Route path="/news" element={<JobNews />} />
          <Route path="/dsa-tracker" element={<DSATracker />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
