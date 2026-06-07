import { useEffect, useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { platformApi, getErrorMessage } from "@/services/platformApi";
import { toast } from "sonner";
import LoadingSkeleton from "@/components/platform/LoadingSkeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

const FUNNEL_COLORS = ["#3b82f6", "#22c55e", "#eab308", "#ef4444", "#10b981"];
const MATCH_COLORS = ["#ef4444", "#eab308", "#22c55e", "#16a34a", "#15803d"];

export default function RecruiterAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    platformApi.getAnalytics()
      .then((res) => setData(res.data))
      .catch((e) => toast.error(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PortalLayout title="Recruiter Analytics" subtitle="Hiring funnel, match distribution, and top candidates">
        <LoadingSkeleton rows={3} />
      </PortalLayout>
    );
  }

  if (!data) return null;

  const funnelData = (data.hiring_funnel || []).map((x) => ({
    name: (x._id || "unknown").replace(/_/g, " "),
    count: x.count,
  }));

  const matchData = (data.match_distribution || []).map((x) => ({
    name: x._id === 0 ? "0-40%" : x._id === 40 ? "40-60%" : x._id === 60 ? "60-75%" : x._id === 75 ? "75-90%" : x._id === 90 ? "90-100%" : String(x._id),
    count: x.count,
  }));

  const skillData = (data.skill_distribution || []).slice(0, 8).map((x) => ({
    name: x._id,
    count: x.count,
  }));

  return (
    <PortalLayout title="Recruiter Analytics" subtitle="Real-time hiring intelligence from your applicant pipeline">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card rounded-xl p-6">
          <p className="text-muted-foreground text-sm">Total Jobs</p>
          <h3 className="text-3xl font-bold">{data.kpis.total_jobs}</h3>
        </div>
        <div className="glass-card rounded-xl p-6">
          <p className="text-muted-foreground text-sm">Active Jobs</p>
          <h3 className="text-3xl font-bold">{data.kpis.active_jobs}</h3>
        </div>
        <div className="glass-card rounded-xl p-6">
          <p className="text-muted-foreground text-sm">Total Applicants</p>
          <h3 className="text-3xl font-bold">{data.kpis.total_applicants}</h3>
        </div>
        <div className="glass-card rounded-xl p-6">
          <p className="text-muted-foreground text-sm">Avg Match Score</p>
          <h3 className="text-3xl font-bold text-primary">{data.kpis.avg_match_score}%</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Hiring Funnel</h3>
          {funnelData.length === 0 ? (
            <p className="text-muted-foreground text-sm">No applications yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={funnelData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {funnelData.map((_, i) => (
                    <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Match Score Distribution</h3>
          {matchData.length === 0 ? (
            <p className="text-muted-foreground text-sm">No match data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={matchData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {matchData.map((_, i) => (
                    <Cell key={i} fill={MATCH_COLORS[i % MATCH_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Top Skill Gaps (Across Applicants)</h3>
          {skillData.length === 0 ? (
            <p className="text-muted-foreground text-sm">No skill gap data</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={skillData} layout="vertical">
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#22c55e" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Top Candidates</h3>
          <div className="space-y-3">
            {(data.top_candidates || []).length === 0 ? (
              <p className="text-muted-foreground text-sm">No candidates yet</p>
            ) : (
              data.top_candidates.map((c, i) => (
                <div key={c.application_id} className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">#{i + 1} {c.job_title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{c.application_status?.replace(/_/g, " ")}</p>
                  </div>
                  <p className="text-xl font-bold text-primary">{c.final_match_score}%</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {(data.job_stats?.length > 0) && (
        <div className="glass-card rounded-xl p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Jobs by Applicant Volume</h3>
          <div className="space-y-2">
            {data.job_stats.map((j) => (
              <div key={j.id} className="flex justify-between text-sm p-2 rounded-lg hover:bg-muted/30">
                <span>{j.title} <span className="text-muted-foreground">({j.status})</span></span>
                <span>{j.applicant_count} applicants • avg {Math.round(j.avg_match || 0)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
