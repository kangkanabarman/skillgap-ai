import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Mail, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const email = localStorage.getItem('email');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
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

      <div className="p-6 md:p-12 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground mb-12">
            Manage your account settings
          </p>

          <div className="glass-card rounded-xl p-8 mb-6">
            <h2 className="text-xl font-semibold mb-6">Account Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold" data-testid="profile-email">{email}</p>
                </div>
              </div>
            </div>
          </div>

          <Button
            data-testid="logout-btn"
            variant="destructive"
            onClick={handleLogout}
            className="w-full rounded-md"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
