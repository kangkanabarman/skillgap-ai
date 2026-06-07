import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PortalLayout from "@/components/PortalLayout";
import { platformApi, getErrorMessage } from "@/services/platformApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Users, Briefcase } from "lucide-react";
import { toast } from "sonner";
import LoadingSkeleton from "@/components/platform/LoadingSkeleton";
import EmptyState from "@/components/platform/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await platformApi.listRecruiterJobs({ limit: 50 });
      setJobs(res.data.items || []);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const remove = async (jobId) => {
    if (!window.confirm("Delete this job and all applications?")) return;
    try {
      await platformApi.deleteJob(jobId);
      toast.success("Job deleted");
      fetchJobs();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <PortalLayout title="Active Jobs" subtitle="Manage postings, view applicants, and trigger dynamic AI recalculation on JD edits">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-muted-foreground">{jobs.length} job(s) posted</p>
        <Button onClick={() => navigate("/recruiter/create-job")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Post a Job
        </Button>
      </div>

      {loading ? (
        <LoadingSkeleton rows={3} />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs posted yet"
          description="Create your first job posting to start receiving AI-ranked applicants."
          action={<Button onClick={() => navigate("/recruiter/create-job")}>Post a Job</Button>}
        />
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Applicants</TableHead>
                <TableHead>Avg Match</TableHead>
                <TableHead>Top Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-xs text-muted-foreground">{job.company_name}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{job.job_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {job.applicant_count || 0}
                    </span>
                  </TableCell>
                  <TableCell>{job.avg_match_score || 0}%</TableCell>
                  <TableCell className="text-primary font-medium">{job.top_match_score || 0}%</TableCell>
                  <TableCell>
                    <Badge variant={job.status === "active" ? "default" : "secondary"}>{job.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/recruiter/jobs/${job.id}/applicants`)}>
                      Applicants
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/recruiter/edit-job/${job.id}`)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => remove(job.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </PortalLayout>
  );
}
