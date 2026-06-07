import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PortalLayout from "@/components/PortalLayout";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { client, authHeaders } from "@/lib/api";
import {
  Briefcase,
  FileSearch,
  ListChecks,
  PlusCircle,
  Newspaper,
  Code2,
  Sparkles,
  BarChart3,
} from "lucide-react";

const STUDENT_MAIN = [
  {
    title: "Apply for Jobs",
    description: "Browse roles, upload your resume, apply instantly, and get AI match insights.",
    icon: Briefcase,
    to: "/find-jobs",
    variant: "primary",
    badge: "Core",
  },
  {
    title: "View Analysis",
    description: "Track applications, match scores, missing skills, and AI recommendations.",
    icon: ListChecks,
    to: "/applications",
    variant: "primary",
    badge: "Core",
  },
];

const STUDENT_SUB = [
  {
    title: "Career Test",
    description: "Discover your ideal career path with AI-guided assessment.",
    icon: Sparkles,
    to: "/career-test",
  },
  {
    title: "DSA Tracker",
    description: "Company-wise LeetCode progress with local tracking.",
    icon: Code2,
    to: "/dsa-tracker",
  },
  {
    title: "Hiring News",
    description: "Latest hiring trends and recruitment updates.",
    icon: Newspaper,
    to: "/news",
  },
];

const RECRUITER_CARDS = [
  {
    title: "Post a Job",
    description: "Create listings, upload JD files, and auto-extract skills.",
    icon: PlusCircle,
    to: "/recruiter/create-job",
    variant: "primary",
    badge: "Core",
  },
  {
    title: "Active Jobs",
    description: "Manage postings, review applicants, and update hiring pipeline.",
    icon: FileSearch,
    to: "/recruiter/jobs",
    variant: "primary",
    badge: "Core",
  },
  {
    title: "Analytics",
    description: "Hiring funnel, top candidates, and skill gap insights.",
    icon: BarChart3,
    to: "/recruiter/analytics",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "student";
  const name = localStorage.getItem("name") || "there";
  const [kpis, setKpis] = useState(null);

  useEffect(() => {
    if (role === "recruiter") {
      client
        .get("/platform/recruiter/analytics", { headers: authHeaders() })
        .then((r) => setKpis(r.data?.kpis || null))
        .catch(() => setKpis(null));
    }
  }, [role]);

  if (role === "recruiter") {
    return (
      <PortalLayout
        title={`Welcome, ${name}`}
        subtitle="Recruiter command center — post jobs and manage AI-ranked applicants"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass-card rounded-xl p-6">
            <p className="text-muted-foreground text-sm">Total Jobs</p>
            <h3 className="text-3xl font-bold mt-1">{kpis?.total_jobs ?? "—"}</h3>
          </div>
          <div className="glass-card rounded-xl p-6">
            <p className="text-muted-foreground text-sm">Total Applicants</p>
            <h3 className="text-3xl font-bold mt-1">{kpis?.total_applicants ?? "—"}</h3>
          </div>
          <div className="glass-card rounded-xl p-6">
            <p className="text-muted-foreground text-sm">Avg Match Score</p>
            <h3 className="text-3xl font-bold mt-1 text-primary">{kpis?.avg_match_score ?? "—"}%</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {RECRUITER_CARDS.map((card, i) => (
            <DashboardCard key={card.title} {...card} delay={i * 0.05} />
          ))}
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout
      title={`Welcome back, ${name}`}
      subtitle="Your AI-powered career cockpit — apply smarter, learn faster"
    >
      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-4">Main Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STUDENT_MAIN.map((card, i) => (
            <DashboardCard key={card.title} {...card} delay={i * 0.05} />
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Sub Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STUDENT_SUB.map((card, i) => (
            <DashboardCard key={card.title} {...card} delay={0.1 + i * 0.05} />
          ))}
        </div>
      </section>
    </PortalLayout>
  );
}
