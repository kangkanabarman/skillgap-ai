import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CareerResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/career-test/results`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(response.data);
    } catch (error) {
      console.error('Failed to fetch results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen aurora-gradient flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const latestResult = results[0];

  if (!latestResult) {
    return (
      <div className="min-h-screen aurora-gradient flex items-center justify-center">
        <div className="text-center" data-testid="no-results">
          <h2 className="text-2xl font-bold mb-4">No Test Results Yet</h2>
          <Button
            data-testid="take-test-btn"
            onClick={() => navigate('/career-test')}
            className="rounded-md btn-hover"
          >
            Take the Career Test
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen aurora-gradient">
      <nav className="p-6 md:p-12 flex justify-between items-center border-b border-border/50">
        <div
          className="text-2xl font-bold tracking-tight cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          SkillGap <span className="text-primary">AI</span>
        </div>
        <Button
          data-testid="back-dashboard-btn"
          variant="outline"
          onClick={() => navigate('/dashboard')}
          className="rounded-md"
        >
          Back to Dashboard
        </Button>
      </nav>

      <div className="p-6 md:p-12 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-2">Your Career Path</h1>
          <p className="text-muted-foreground mb-12">
            Based on your personality assessment
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-xl p-12 text-center mb-8"
            data-testid="career-path-card"
          >
            <Sparkles className="h-16 w-16 mx-auto mb-4 text-accent" />
            <h2 className="text-4xl font-bold mb-4 text-accent">
              {latestResult.career_path}
            </h2>
            <p className="text-sm text-muted-foreground">
              Recommended career path for you
            </p>
          </motion.div>

          <div className="glass-card rounded-xl p-8 mb-8">
            <h3 className="text-2xl font-semibold mb-4">Why This Path?</h3>
            <div
              className="prose prose-invert max-w-none text-muted-foreground whitespace-pre-wrap"
              data-testid="career-explanation"
            >
              {latestResult.explanation}
            </div>
          </div>

          {results.length > 1 && (
            <div>
              <h3 className="text-2xl font-bold mb-6">Previous Results</h3>
              <div className="space-y-4">
                {results.slice(1).map((result, idx) => (
                  <div
                    key={result.id}
                    className="glass-card rounded-xl p-6"
                    data-testid={`previous-result-${idx}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-lg font-semibold text-accent">
                          {result.career_path}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(result.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-4">
            <Button
              data-testid="retake-test-btn"
              onClick={() => navigate('/career-test')}
              className="flex-1 rounded-md btn-hover"
            >
              Retake Test
            </Button>
            <Button
              data-testid="upload-resume-btn"
              variant="outline"
              onClick={() => navigate('/upload-resume')}
              className="flex-1 rounded-md"
            >
              Upload Resume
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
