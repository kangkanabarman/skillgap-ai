import { useCallback, useEffect, useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListChecks } from "lucide-react";
import { toast } from "sonner";
import { platformApi, getErrorMessage } from "@/services/platformApi";
import LoadingSkeleton from "@/components/platform/LoadingSkeleton";
import EmptyState from "@/components/platform/EmptyState";
import StatusBadge from "@/components/platform/StatusBadge";
import MatchScoreCard from "@/components/platform/MatchScoreCard";
import SkillTags from "@/components/platform/SkillTags";

const STATUSES = ["all", "applied", "shortlisted", "under_review", "rejected", "selected"];

export default function ApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (status !== "all") params.status = status;
      const res = await platformApi.listApplications(params);
      setApps(res.data.items || []);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  return (
    <PortalLayout title="View Analysis" subtitle="All applications, AI scores, recommendations, and recruiter decisions">
      <Tabs value={status} onValueChange={setStatus} className="mb-6">
        <TabsList className="flex flex-wrap h-auto gap-1">
          {STATUSES.map((s) => (
            <TabsTrigger key={s} value={s} className="capitalize">{s.replace(/_/g, " ")}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <LoadingSkeleton rows={3} />
      ) : apps.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No applications yet"
          description="Apply to jobs from the Apply for Jobs page to see your AI analysis here."
        />
      ) : (
        <div className="space-y-4">
          {apps.map((app) => (
            <div key={app.id} className="glass-card rounded-xl p-6">
              <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-lg font-semibold">{app.job?.title || "Job"}</h3>
                    <StatusBadge status={app.application_status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {app.job?.company_name} • {app.job?.location} • {app.job?.work_mode}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Applied {app.created_at ? new Date(app.created_at).toLocaleDateString() : ""}
                  </p>
                </div>
                <MatchScoreCard
                  finalScore={app.final_match_score}
                  semanticScore={app.semantic_score}
                  tfidfScore={app.tfidf_score}
                  skillScore={app.skill_match_score}
                  compact
                />
              </div>

              <p className="text-sm mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                {app.ai_recommendation}
              </p>

              <button
                type="button"
                className="text-sm text-primary mt-3 hover:underline"
                onClick={() => setExpanded(expanded === app.id ? null : app.id)}
              >
                {expanded === app.id ? "Hide details" : "Show full AI report"}
              </button>

              {expanded === app.id && (
                <div className="mt-4 pt-4 border-t border-border grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Matched Skills</p>
                    <SkillTags skills={app.matched_skills} variant="matched" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Missing Skills</p>
                    <SkillTags skills={app.missing_skills} variant="missing" />
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium mb-2">Learning Roadmap</p>
                    <p className="text-sm text-muted-foreground">{app.learning_roadmap || app.ai_recommendation}</p>
                  </div>
                  <div className="md:col-span-2">
                    <MatchScoreCard
                      finalScore={app.final_match_score}
                      semanticScore={app.semantic_score}
                      tfidfScore={app.tfidf_score}
                      skillScore={app.skill_match_score}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}
