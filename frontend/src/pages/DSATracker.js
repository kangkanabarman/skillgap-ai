import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { client } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { toast } from 'sonner';
import { Code2, ExternalLink, Loader2 } from 'lucide-react';

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

const PERIOD_LABELS = {
  '1. Thirty Days': 'Last 30 days',
  '2. Three Months': 'Last 3 months',
  '3. Six Months': 'Last 6 months',
  '4. More Than Six Months': '6+ months',
  '5. All': 'All time',
};

export default function DSATracker() {
  const [data, setData] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('5. All');
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(getStoredProgress);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [companyOpen, setCompanyOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [periodsRes, companiesRes] = await Promise.all([
          client.get('/dsa/periods'),
          client.get('/dsa/companies'),
        ]);
        const periodList = periodsRes.data || [];
        const companyList = companiesRes.data || [];
        setPeriods(periodList);
        setCompanies(companyList);
        setSelectedPeriod((prev) =>
          periodList.includes(prev) ? prev : periodList.includes('5. All') ? '5. All' : periodList[0] || '5. All'
        );
        setSelectedCompany((prev) => prev || companyList[0] || '');
      } catch (err) {
        console.error('API Error:', err);
        toast.info('Using demo data.');
        setData(MOCK_DSA_DATA);
        setCompanies([...new Set(MOCK_DSA_DATA.flatMap((p) => p.companies || []))].sort());
        setSelectedCompany('Amazon');
        setLoading(false);
      }
    };

    fetchMeta();
  }, []);

  useEffect(() => {
    if (!selectedPeriod) return;

    const fetchProblems = async () => {
      setLoading(true);
      try {
        const res = await client.get('/dsa/all', {
          params: { period: selectedPeriod },
        });
        setData(res.data || []);
      } catch (err) {
        console.error('API Error:', err);
        setData(MOCK_DSA_DATA);
        toast.info('Using demo data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [selectedPeriod]);

const topics = useMemo(
  () =>
    selectedCompany
      ? [
          ...new Set(
            data
              .filter((p) => p.companies?.includes(selectedCompany))
              .flatMap((p) => p.topics || [])
          ),
        ].sort()
      : [],
  [data, selectedCompany]
);

  useEffect(() => {
  if (selectedCompany && !topics.includes(selectedTopic)) {
    setSelectedTopic('all');
  }
}, [selectedCompany, selectedTopic, topics]);

const filteredData = data.filter((p) => {
  if (!p.companies?.includes(selectedCompany)) return false;

  if (selectedTopic !== 'all' && selectedTopic && !p.topics?.includes(selectedTopic))
    return false;

  if (selectedDifficulty !== 'all' && p.difficulty !== selectedDifficulty)
    return false;

  return true;
});

  const toggleProblem = (url) => {
    const next = { ...progress, [url]: !progress[url] };
    setProgress(next);
    saveProgress(next);
  };

  const completedCount = Object.values(progress).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="bg-background/80 backdrop-blur-md p-6 md:p-12 flex justify-between items-center border-b border-border">
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
            LeetCode company-wise DSA problems — filter by company, topic, difficulty, and interview window
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
<Select
    open={companyOpen}
    onOpenChange={setCompanyOpen}
    value={selectedCompany}
    onValueChange={setSelectedCompany}
  >
    <SelectTrigger className="w-[180px] bg-input/50">
      <SelectValue>
  {selectedCompany || "Select company"}
</SelectValue>
    </SelectTrigger>
<SelectContent>
      <Command>
        <CommandInput placeholder="Search company..." />
        <CommandEmpty>No company found.</CommandEmpty>
        <CommandGroup className="max-h-60 overflow-y-auto">
          {companies.map((c) => (
            <CommandItem
              key={c}
              value={c}
              onSelect={() => {
                setSelectedCompany(c)
                setCompanyOpen(false)
              }}
              className="cursor-pointer"
            >
              {c}
            </CommandItem>
          ))}
        </CommandGroup>
      </Command>
    </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Time window</label>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger className="w-[200px] bg-input/50">
                        <SelectValue placeholder="All time" />
                      </SelectTrigger>
                      <SelectContent>
                        {periods.map((p) => (
                          <SelectItem key={p} value={p}>
                            {PERIOD_LABELS[p] || p}
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
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Difficulty</label>
                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger className="w-[160px] bg-input/50">
                        <SelectValue placeholder="All difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
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

        <span className="text-xs text-muted-foreground hidden sm:inline max-w-[200px] truncate">
          {p.topics?.join(", ")}
        </span>

        {p.frequency != null && (
          <span className="text-xs text-muted-foreground hidden md:inline">
            {Math.round(p.frequency)}%
          </span>
        )}

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
