import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Newspaper, ExternalLink, Loader2, RefreshCw } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function JobNews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/news/jobs`, { params: { count: 15 } });
      setArticles(res.data.articles || []);
      if (!res.data.articles?.length) {
        toast.info('No news loaded. Add GNEWS_API_KEY to backend .env for live hiring news.');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load news');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

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
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-bold mb-2">Hiring & Job News</h1>
              <p className="text-muted-foreground">
                Real-time hiring, recruitment, and placement news in India
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={fetchNews}
              disabled={loading}
              className="rounded-md"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>

          {loading ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">Loading news...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <Newspaper className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No news available</h3>
              <p className="text-muted-foreground mb-4">
                Add GNEWS_API_KEY to your backend .env to fetch hiring news.
                <br />
                Get a free key at{' '}
                <a
                  href="https://gnews.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  gnews.io
                </a>{' '}
                (100 requests/day free).
              </p>
              <Button variant="outline" onClick={fetchNews} className="rounded-md">
                Retry
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((a, i) => (
                <motion.a
                  key={i}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-xl p-6 block hover:border-primary/50 transition-colors group"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {a.title}
                      </h3>
                      {a.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {a.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{a.source}</span>
                        {a.publishedAt && (
                          <>
                            <span>·</span>
                            <span>{new Date(a.publishedAt).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </motion.a>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
