import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Target, Brain, TrendingUp, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen aurora-gradient">
      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="p-6 md:p-12 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold tracking-tight"
          >
            SkillGap <span className="text-primary">AI</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <ThemeToggle />
            <Button
              data-testid="nav-login-btn"
              variant="outline"
              onClick={() => navigate('/auth')}
              className="rounded-md"
            >
              Login
            </Button>
          </motion.div>
        </nav>

        {/* Hero Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Bridge Your Skill Gap.
                <br />
                <span className="text-primary">Land Your Dream Job.</span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                AI-powered resume analysis and career guidance. Discover missing skills,
                get personalized learning roadmaps, and find your perfect career path.
              </p>
              <Button
                data-testid="hero-get-started-btn"
                size="lg"
                onClick={() => navigate('/auth')}
                className="rounded-md btn-hover glow-primary px-8 py-6 text-lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Get Started Free
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features for Your Career Growth
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-xl p-6 hover:border-primary/50 transition-colors duration-300"
            >
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Skill Gap Analysis</h3>
              <p className="text-muted-foreground">
                Upload your resume and compare it against your dream job. Get precise
                match percentages and identify exactly what skills you need.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-xl p-6 hover:border-primary/50 transition-colors duration-300"
            >
              <div className="h-12 w-12 rounded-md bg-accent/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Learning Roadmap</h3>
              <p className="text-muted-foreground">
                Get AI-generated learning paths tailored to your goals. Includes course
                recommendations, timelines, and resources.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-xl p-6 hover:border-primary/50 transition-colors duration-300"
            >
              <div className="h-12 w-12 rounded-md bg-destructive/10 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Career Test</h3>
              <p className="text-muted-foreground">
                Take our psychological assessment to discover which tech career path
                truly fits your personality and thinking style.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto glass-card rounded-xl p-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Career?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of professionals already using SkillGap AI
          </p>
          <Button
            data-testid="cta-start-btn"
            size="lg"
            onClick={() => navigate('/auth')}
            className="rounded-md btn-hover glow-primary px-8 py-6 text-lg"
          >
            Start Your Journey
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
