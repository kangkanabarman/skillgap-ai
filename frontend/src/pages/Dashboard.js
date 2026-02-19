import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Brain, LogOut, Newspaper, Code2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard() {
  const [analyses, setAnalyses] = useState([]);
  const [careerResults, setCareerResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [analysesRes, careerRes] = await Promise.all([
        axios.get(`${API}/skill-analyses`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/career-test/results`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setAnalyses(analysesRes.data);
      setCareerResults(careerRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen aurora-gradient">
      {/* Header */}
      <nav className="p-6 md:p-12 flex justify-between items-center border-b border-border/50">
        <div className="text-2xl font-bold tracking-tight">
          SkillGap <span className="text-primary">AI</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            data-testid="profile-btn"
            variant="outline"
            onClick={() => navigate('/profile')}
            className="rounded-md"
          >
            Profile
          </Button>
          <Button
            data-testid="logout-btn"
            variant="ghost"
            onClick={handleLogout}
            className="rounded-md"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-muted-foreground mb-12">
            Continue your career development journey
          </p>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-card rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-all"
              onClick={() => navigate('/upload-resume')}
              data-testid="upload-resume-card"
            >
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Resume</h3>
              <p className="text-sm text-muted-foreground">
                Analyze your resume and discover skill gaps
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-card rounded-xl p-6 cursor-pointer hover:border-accent/50 transition-all"
              onClick={() => navigate('/career-test')}
              data-testid="career-test-card"
            >
              <div className="h-12 w-12 rounded-md bg-accent/10 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Career Test</h3>
              <p className="text-sm text-muted-foreground">
                Find your perfect tech career path
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-card rounded-xl p-6 cursor-pointer hover:border-destructive/50 transition-all"
              onClick={() => navigate('/skill-analysis')}
              data-testid="view-analyses-card"
            >
              <div className="h-12 w-12 rounded-md bg-destructive/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold mb-2">View Analyses</h3>
              <p className="text-sm text-muted-foreground">
                Review your skill gap reports
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-card rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-all"
              onClick={() => navigate('/news')}
              data-testid="job-news-card"
            >
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                <Newspaper className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Hiring News</h3>
              <p className="text-sm text-muted-foreground">
                Real-time job and hiring news
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-card rounded-xl p-6 cursor-pointer hover:border-accent/50 transition-all"
              onClick={() => navigate('/dsa-tracker')}
              data-testid="dsa-tracker-card"
            >
              <div className="h-12 w-12 rounded-md bg-accent/10 flex items-center justify-center mb-4">
                <Code2 className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">DSA Tracker</h3>
              <p className="text-sm text-muted-foreground">
                Company-wise LeetCode problems
              </p>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            {analyses.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Recent Skill Analyses</h2>
                <div className="space-y-4">
                  {analyses.slice(0, 3).map((analysis, idx) => (
                    <motion.div
                      key={analysis.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="glass-card rounded-xl p-6"
                      data-testid={`analysis-item-${idx}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {analysis.company} - {analysis.role}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(analysis.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-mono font-bold text-primary">
                            {analysis.match_percentage}%
                          </div>
                          <div className="text-xs text-muted-foreground">Match</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {analysis.missing_skills.slice(0, 5).map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-destructive/10 text-destructive rounded-md text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                        {analysis.missing_skills.length > 5 && (
                          <span className="px-3 py-1 bg-muted text-muted-foreground rounded-md text-sm">
                            +{analysis.missing_skills.length - 5} more
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {careerResults.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Career Test Results</h2>
                <div className="space-y-4">
                  {careerResults.slice(0, 2).map((result, idx) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="glass-card rounded-xl p-6"
                      data-testid={`career-result-item-${idx}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-accent">
                            {result.career_path}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(result.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate('/career-results')}
                          className="rounded-md"
                        >
                          View Details
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {analyses.length === 0 && careerResults.length === 0 && (
              <div className="glass-card rounded-xl p-12 text-center" data-testid="empty-state">
                <h3 className="text-xl font-semibold mb-2">Get Started</h3>
                <p className="text-muted-foreground mb-6">
                  Upload your resume or take the career test to begin
                </p>
                <div className="flex gap-4 justify-center">
                  <Button
                    data-testid="empty-upload-btn"
                    onClick={() => navigate('/upload-resume')}
                    className="rounded-md btn-hover"
                  >
                    Upload Resume
                  </Button>
                  <Button
                    data-testid="empty-career-test-btn"
                    variant="outline"
                    onClick={() => navigate('/career-test')}
                    className="rounded-md"
                  >
                    Take Career Test
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
