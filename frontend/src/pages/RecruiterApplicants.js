import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PortalLayout from "@/components/PortalLayout";
import { platformApi, getErrorMessage } from "@/services/platformApi";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import LoadingSkeleton from "@/components/platform/LoadingSkeleton";
import StatusBadge from "@/components/platform/StatusBadge";
import MatchScoreCard from "@/components/platform/MatchScoreCard";
import SkillTags from "@/components/platform/SkillTags";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalLink } from "lucide-react";

const STATUSES = ["applied", "shortlisted", "under_review", "rejected", "selected"];

export default function RecruiterApplicants() {
  const { jobId } = useParams();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort_by: "match", limit: 50 };
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await platformApi.listApplicants(jobId, params);
      setApps(res.data.items || []);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [jobId, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (appId, status) => {
    try {
      await platformApi.updateApplicationStatus(appId, { application_status: status });
      toast.success(`Marked as ${status.replace(/_/g, " ")}`);
      load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <PortalLayout title="Applicants" subtitle="AI-ranked candidates with full skill breakdown and pipeline controls">
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Filter status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/recruiter/edit-job/${jobId}`}>Edit Job / Recalculate Matches</Link>
        </Button>
      </div>

      {loading ? (
        <LoadingSkeleton rows={3} />
      ) : apps.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No applicants yet for this job.</p>
      ) : (
        <div className="space-y-4">
          {apps.map((app, idx) => (
            <div key={app.id} className="glass-card rounded-xl p-6">
              <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-semibold">#{idx + 1} Candidate</span>
                    <StatusBadge status={app.application_status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {app.student_snapshot?.degree} • {app.student_snapshot?.college_name} • CGPA: {app.student_snapshot?.cgpa ?? "N/A"}
                  </p>
                  <p className="text-sm mt-2">{app.ai_summary}</p>
                  {app.resume_url && (
                    <a href={app.resume_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary mt-2 hover:underline">
                      View Resume <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <MatchScoreCard
                  finalScore={app.final_match_score}
                  semanticScore={app.semantic_score}
                  tfidfScore={app.tfidf_score}
                  skillScore={app.skill_match_score}
                  compact
                />
              </div>

              <button
                type="button"
                className="text-sm text-primary mt-3 hover:underline"
                onClick={() => setExpanded(expanded === app.id ? null : app.id)}
              >
                {expanded === app.id ? "Hide breakdown" : "Show skill breakdown"}
              </button>

              {expanded === app.id && (
                <div className="mt-4 pt-4 border-t border-border grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Matched Skills</p>
                    <SkillTags skills={app.matched_skills} />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Missing Skills</p>
                    <SkillTags skills={app.missing_skills} variant="missing" />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                {STATUSES.map((st) => (
                  <Button
                    key={st}
                    variant={app.application_status === st ? "default" : "outline"}
                    size="sm"
                    className="capitalize"
                    onClick={() => setStatus(app.id, st)}
                  >
                    {st.replace(/_/g, " ")}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}
