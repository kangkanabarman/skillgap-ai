import { useCallback, useEffect, useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Search } from "lucide-react";
import { toast } from "sonner";
import { platformApi, getErrorMessage } from "@/services/platformApi";
import LoadingSkeleton from "@/components/platform/LoadingSkeleton";
import EmptyState from "@/components/platform/EmptyState";
import JobDetailDialog from "@/components/platform/JobDetailDialog";
import ApplyJobDialog from "@/components/platform/ApplyJobDialog";

export default function FindJobs() {
  const [q, setQ] = useState("");
  const [jobType, setJobType] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasResume, setHasResume] = useState(false);
  const [detailJob, setDetailJob] = useState(null);
  const [applyJob, setApplyJob] = useState(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { q, page, limit: 10, sort_by: "match" };
      if (jobType) params.job_type = jobType;
      if (workMode) params.work_mode = workMode;
      if (location) params.location = location;
      const res = await platformApi.listJobs(params);
      setJobs(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [q, page, jobType, workMode, location]);

  useEffect(() => {
    platformApi.getStudentProfile()
      .then((r) => setHasResume(Boolean(r.data?.student?.resume_url)))
      .catch(() => setHasResume(false));
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const openApply = (job) => {
    if (job.already_applied) {
      toast.info("You already applied to this job");
      return;
    }
    setApplyJob(job);
  };

  return (
    <PortalLayout title="Apply for Jobs" subtitle="Browse live openings, run AI matching, and apply in one flow">
      <div className="glass-card rounded-xl p-4 mb-6 space-y-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title, company, skill..."
              className="pl-9"
              onKeyDown={(e) => e.key === "Enter" && (setPage(1), fetchJobs())}
            />
          </div>
          <Button onClick={() => { setPage(1); fetchJobs(); }}>Search</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Select value={jobType || "all"} onValueChange={(v) => setJobType(v === "all" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Job type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
            </SelectContent>
          </Select>
          <Select value={workMode || "all"} onValueChange={(v) => setWorkMode(v === "all" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Work mode" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All modes</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
              <SelectItem value="onsite">Onsite</SelectItem>
            </SelectContent>
          </Select>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location filter" />
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs found"
          description="Recruiters haven't posted matching jobs yet, or try different filters."
        />
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="glass-card rounded-xl p-6 hover:border-primary/30 transition-colors">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                <div className="flex-1 cursor-pointer" onClick={() => setDetailJob(job)}>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-xl font-semibold">{job.title}</h3>
                    {job.already_applied && <Badge variant="outline">Applied</Badge>}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {job.company_name} • {job.location || "Location TBD"} • {job.work_mode} • {job.job_type}
                  </p>
                  <p className="text-sm mt-3 line-clamp-2">{job.description}</p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {(job.required_skills || []).slice(0, 5).map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">{job.recommended_match_score || 0}%</p>
                    <p className="text-xs text-muted-foreground">AI Match</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setDetailJob(job)}>Details</Button>
                    <Button size="sm" disabled={job.already_applied} onClick={() => openApply(job)}>
                      {job.already_applied ? "Applied" : "Apply"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Page {page} • {total} jobs</p>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <Button variant="outline" disabled={page * 10 >= total} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      </div>

      <JobDetailDialog
        job={detailJob}
        open={Boolean(detailJob)}
        onOpenChange={(v) => !v && setDetailJob(null)}
        onApply={openApply}
      />
      <ApplyJobDialog
        job={applyJob}
        open={Boolean(applyJob)}
        onOpenChange={(v) => !v && setApplyJob(null)}
        hasResume={hasResume}
        onApplied={() => { setHasResume(true); fetchJobs(); }}
      />
    </PortalLayout>
  );
}
