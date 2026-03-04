import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Code2, ExternalLink, Loader2 } from 'lucide-react';

// Use environment variable or fallback to localhost
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

const PROGRESS_KEY = 'dsa-progress';

// Mock data as fallback when API is unavailable
const MOCK_DSA_DATA = [
  {
    title: "Two Sum",
    url: "https://leetcode.com/problems/two-sum",
    difficulty: "Easy",
    topics: ["Arrays", "Hashing"],
    companies: ["Amazon", "Google", "Microsoft"]
  },
  {
    title: "Best Time to Buy and Sell Stock",
    url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock",
    difficulty: "Easy",
    topics: ["Arrays"],
    companies: ["Amazon"]
  },
  {
    title: "Maximum Subarray",
    url: "https://leetcode.com/problems/maximum-subarray",
    difficulty: "Medium",
    topics: ["Arrays", "Dynamic Programming"],
    companies: ["Google"]
  }
];

function getStoredProgress() {
  try {
    const s = localStorage.getItem(PROGRESS_KEY);
    return s ? JSON.parse(s) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export default function DSATracker() {
  const [data, setData] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(getStoredProgress);
  const navigate = useNavigate();

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/dsa/all`);
      const problems = res.data || [];

      setData(problems);

      // Extract companies from new structure
      const comps = [
        ...new Set(
          problems.flatMap((p) => p.companies || [])
        ),
      ].sort();

      setCompanies(comps);

      if (comps.length && !selectedCompany) {
        setSelectedCompany(comps[0]);
      }

    } catch (err) {
      console.error('API Error:', err);
      setData(MOCK_DSA_DATA);
      toast.info('Using demo data.');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

const topics = selectedCompany
  ? [
      ...new Set(
        data
          .filter((p) => p.companies?.includes(selectedCompany))
          .flatMap((p) => p.topics || [])
      ),
    ].sort()
  : [];

  useEffect(() => {
  if (selectedCompany && !topics.includes(selectedTopic)) {
    setSelectedTopic('all');
  }
}, [selectedCompany]);

const filteredData = data.filter((p) => {
  if (!p.companies?.includes(selectedCompany)) return false;

  if (selectedTopic === 'all' || !selectedTopic) return true;

  return p.topics?.includes(selectedTopic);
});

  const toggleProblem = (url) => {
    const next = { ...progress, [url]: !progress[url] };
    setProgress(next);
    saveProgress(next);
  };

  const completedCount = Object.values(progress).filter(Boolean).length;

  return (
    <div className="min-h-screen aurora-gradient">
      <nav className="p-6 md:p-12 flex justify-between items-center border-b border-border/50">
        <div
          className="text-2xl font-bold tracking-tight cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          SkillGap <span className="text-primary">AI</span>
        </div>
        <Button variant="outline" onClick={() => navigate('/dashboard')} className="rounded-md">
          Back to Dashboard
        </Button>
      </nav>

      <div className="p-6 md:p-12 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <Code2 className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">DSA Tracker by Company</h1>
          </div>
          <p className="text-muted-foreground mb-8">
            Striver SDE Sheet & Love Babbar 450 style problems by company
          </p>

          {loading ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">Loading problems...</p>
            </div>
          ) : (
            <>
              <div className="glass-card rounded-xl p-6 mb-8">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Company</label>
                    <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                      <SelectTrigger className="w-[180px] bg-input/50">
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Topic</label>
                    <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                      <SelectTrigger className="w-[180px] bg-input/50">
                        <SelectValue placeholder="All topics" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All topics</SelectItem>
                        {topics.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Completed:</span>
                    <span className="font-mono font-bold text-primary">{completedCount}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
  {filteredData.map((p, idx) => (
    <motion.div
      key={p.url}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.03 }}
      className="glass-card rounded-xl p-4"
    >
      <div className="flex items-center gap-3">

        <Checkbox
          checked={!!progress[p.url]}
          onCheckedChange={() => toggleProblem(p.url)}
        />

        <span
          className={`flex-1 ${
            progress[p.url] ? 'line-through text-muted-foreground' : ''
          }`}
        >
          {p.title}
        </span>

        <span className="text-xs text-muted-foreground">
          {p.topics?.join(", ")}
        </span>

        {p.difficulty && (
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              p.difficulty === 'Easy'
                ? 'bg-green-500/20 text-green-400'
                : p.difficulty === 'Medium'
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {p.difficulty}
          </span>
        )}

        <a
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline flex items-center gap-1"
        >
          <ExternalLink className="h-4 w-4" />
          Open
        </a>

      </div>
    </motion.div>
  ))}
</div>

              {filteredData.length === 0 && !loading && (
                <div className="glass-card rounded-xl p-12 text-center">
                  <p className="text-muted-foreground">No problems found for selected filters.</p>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
