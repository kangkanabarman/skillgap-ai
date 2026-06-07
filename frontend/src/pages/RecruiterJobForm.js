import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PortalLayout from "@/components/PortalLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { platformApi, getErrorMessage } from "@/services/platformApi";
import { toast } from "sonner";

const initial = {
  title: "", company_name: "", description: "", required_skills: "", preferred_skills: "",
  minimum_cgpa: "", stipend: "", salary: "", location: "", work_mode: "onsite", job_type: "full-time",
  joining_date: "", application_deadline: "", experience_required: "", openings: 1, status: "active",
};

export default function RecruiterJobForm({ edit = false }) {
  const [form, setForm] = useState(initial);
  const [jdFile, setJdFile] = useState(null);
  const navigate = useNavigate();
  const { jobId } = useParams();

  useEffect(() => {
    if (edit && jobId) {
      platformApi.listRecruiterJobs({ limit: 100 }).then((r) => {
        const job = (r.data.items || []).find((j) => j.id === jobId);
        if (job) {
          setForm({ ...job, required_skills: (job.required_skills || []).join(", "), preferred_skills: (job.preferred_skills || []).join(", ") });
        }
      }).catch((e) => toast.error(getErrorMessage(e)));
    }
  }, [edit, jobId]);

  const submit = async () => {
    const fd = new FormData();
    const payload = {
      ...form,
      required_skills: form.required_skills.split(",").map((s) => s.trim()).filter(Boolean),
      preferred_skills: form.preferred_skills.split(",").map((s) => s.trim()).filter(Boolean),
      openings: Number(form.openings || 1),
      minimum_cgpa: form.minimum_cgpa ? Number(form.minimum_cgpa) : null,
    };
    fd.append("payload_json", JSON.stringify(payload));
    if (jdFile) fd.append("jd_file", jdFile);
    try {
      if (edit) {
        const res = await platformApi.updateJob(jobId, fd);
        const n = res.data.recalculated_applications;
        toast.success(n ? `Job updated — ${n} application(s) recalculated` : "Job updated");
      } else {
        await platformApi.createJob(fd);
        toast.success("Job created — visible to students immediately");
      }
      navigate("/recruiter/jobs");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <PortalLayout title={edit ? "Edit Job" : "Create Job"} subtitle="JD parsing + dynamic AI matching updates">
      <div className="glass-card rounded-xl p-6 space-y-3">
        <Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Label>Company Name</Label><Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
        <Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <Label>Required Skills (comma separated)</Label><Input value={form.required_skills} onChange={(e) => setForm({ ...form, required_skills: e.target.value })} />
        <Label>Preferred Skills</Label><Input value={form.preferred_skills} onChange={(e) => setForm({ ...form, preferred_skills: e.target.value })} />
        <Label>Minimum CGPA</Label><Input value={form.minimum_cgpa} onChange={(e) => setForm({ ...form, minimum_cgpa: e.target.value })} />
        <Label>Stipend</Label><Input value={form.stipend} onChange={(e) => setForm({ ...form, stipend: e.target.value })} />
        <Label>Salary</Label><Input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
        <Label>Job Type (internship/full-time)</Label><Input value={form.job_type} onChange={(e) => setForm({ ...form, job_type: e.target.value })} />
        <Label>Work Mode (remote/hybrid/onsite)</Label><Input value={form.work_mode} onChange={(e) => setForm({ ...form, work_mode: e.target.value })} />
        <Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <Label>Experience Required</Label><Input value={form.experience_required} onChange={(e) => setForm({ ...form, experience_required: e.target.value })} />
        <Label>Openings</Label><Input type="number" value={form.openings} onChange={(e) => setForm({ ...form, openings: e.target.value })} />
        <Label>Application Deadline</Label><Input type="date" value={form.application_deadline || ""} onChange={(e) => setForm({ ...form, application_deadline: e.target.value })} />
        <Label>Joining Date</Label><Input type="date" value={form.joining_date || ""} onChange={(e) => setForm({ ...form, joining_date: e.target.value })} />
        <Label>JD File (PDF/DOCX)</Label><Input type="file" onChange={(e) => setJdFile(e.target.files[0])} />
        <Button onClick={submit}>{edit ? "Update Job" : "Create Job"}</Button>
      </div>
    </PortalLayout>
  );
}
