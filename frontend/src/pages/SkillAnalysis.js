import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, ExternalLink, Book } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function SkillAnalysis() {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/skill-analyses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalyses(response.data);
    } catch (error) {
      console.error('Failed to fetch analyses:', error);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!company || !role) {
      toast.error('Please enter both company and role');
      return;
    }

    setAnalyzing(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API}/skill-analysis`,
        { company, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAnalysis(response.data);
      toast.success('Analysis complete!');
      fetchAnalyses();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

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

      <div className="p-6 md:p-12 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-2">Skill Gap Analysis</h1>
          <p className="text-muted-foreground mb-12">
            Compare your skills against your target job
          </p>

          {/* Analysis Form */}
          <div className="glass-card rounded-xl p-8 mb-8">
            <h2 className="text-xl font-semibold mb-6">Target Job</h2>
            <form onSubmit={handleAnalyze} className="space-y-6" data-testid="analysis-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    data-testid="company-input"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g., Google"
                    className="bg-input/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    data-testid="role-input"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g., Software Engineer"
                    className="bg-input/50"
                  />
                </div>
              </div>

              <Button
                data-testid="analyze-btn"
                type="submit"
                disabled={analyzing}
                className="w-full rounded-md btn-hover glow-primary"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Skill Gap'
                )}
              </Button>
            </form>
          </div>

          {/* Analysis Results */}
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
              data-testid="analysis-results"
            >
              {/* Match Percentage + Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card rounded-xl p-8 text-center flex flex-col justify-center">
                  <div className="text-6xl font-mono font-bold text-primary mb-2">
                    {analysis.match_percentage}%
                  </div>
                  <div className="text-xl text-muted-foreground">Skill Match</div>
                </div>
                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Skills Overview</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart
                      data={[
                        { name: 'Matched', value: (analysis.job_skills?.length || 0) - (analysis.missing_skills?.length || 0), fill: 'hsl(var(--primary))' },
                        { name: 'Missing', value: analysis.missing_skills?.length || 0, fill: 'hsl(var(--destructive))' },
                      ]}
                      layout="vertical"
                      margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={80} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {[0, 1].map((i) => (
                          <Cell key={i} fill={i === 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Skills Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 text-primary">Your Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.resume_skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-md text-sm"
                        data-testid={`resume-skill-${idx}`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 text-destructive">Missing Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missing_skills.length > 0 ? (
                      analysis.missing_skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-destructive/10 text-destructive rounded-md text-sm"
                          data-testid={`missing-skill-${idx}`}
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No missing skills! You're ready.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Learning Resources (per missing skill) */}
              {analysis.learning_resources && Object.keys(analysis.learning_resources).length > 0 && (
                <div className="glass-card rounded-xl p-8">
                  <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Book className="h-6 w-6 text-primary" />
                    Learning Resources by Skill
                  </h3>
                  <div className="space-y-6">
                    {Object.entries(analysis.learning_resources).map(([skill, resources]) => (
                      <div key={skill}>
                        <h4 className="font-semibold text-primary mb-3">{skill}</h4>
                        <div className="flex flex-wrap gap-3">
                          {resources.slice(0, 3).map((r, i) => (
                            <a
                              key={i}
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm"
                            >
                              <ExternalLink className="h-4 w-4" />
                              {r.platform}: {r.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Roadmap */}
              <div className="glass-card rounded-xl p-8">
                <h3 className="text-2xl font-semibold mb-4">Learning Roadmap</h3>
                <div
                  className="prose prose-invert max-w-none text-muted-foreground whitespace-pre-wrap"
                  data-testid="learning-roadmap"
                >
                  {analysis.learning_roadmap}
                </div>
              </div>
            </motion.div>
          )}

          {/* Previous Analyses */}
          {!analysis && analyses.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Previous Analyses</h2>
              <div className="space-y-4">
                {analyses.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-card rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => setAnalysis(item)}
                    data-testid={`previous-analysis-${idx}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {item.company} - {item.role}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-mono font-bold text-primary">
                          {item.match_percentage}%
                        </div>
                        <div className="text-xs text-muted-foreground">Match</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
