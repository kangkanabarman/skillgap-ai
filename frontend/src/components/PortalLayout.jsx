import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  LogOut,
  LayoutDashboard,
  Briefcase,
  ListChecks,
  Sparkles,
  Code2,
  Newspaper,
  PlusCircle,
  BarChart3,
  User,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const studentNav = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Apply for Jobs", to: "/find-jobs", icon: Briefcase },
  { label: "View Analysis", to: "/applications", icon: ListChecks },
  { label: "Career Test", to: "/career-test", icon: Sparkles },
  { label: "DSA Tracker", to: "/dsa-tracker", icon: Code2 },
  { label: "Hiring News", to: "/news", icon: Newspaper },
];

const recruiterNav = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Post a Job", to: "/recruiter/create-job", icon: PlusCircle },
  { label: "Active Jobs", to: "/recruiter/jobs", icon: Briefcase },
  { label: "Analytics", to: "/recruiter/analytics", icon: BarChart3 },
];

export default function PortalLayout({ title, subtitle, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role") || "student";
  const nav = role === "recruiter" ? recruiterNav : studentNav;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground dashboard-bg">
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <div
            className="text-xl md:text-2xl font-bold tracking-tight cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            SkillGap <span className="text-primary">AI</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={() => navigate("/profile")} className="rounded-md hidden sm:flex">
              <User className="h-4 w-4 mr-1" /> Profile
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="rounded-md">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 shrink-0">
            <div className="glass-card rounded-2xl p-3 space-y-1">
              {nav.map(({ label, to, icon: Icon }) => {
                const active = location.pathname === to || location.pathname.startsWith(`${to}/`);
                return (
                  <button
                    key={to}
                    type="button"
                    onClick={() => navigate(to)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                      active
                        ? "bg-primary/15 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
              {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
