import client, { authHeaders } from "@/lib/api";

const withAuth = (config = {}) => ({
  ...config,
  headers: { ...authHeaders(), ...(config.headers || {}) },
});

export const platformApi = {
  // Jobs
  listJobs: (params) => client.get("/platform/jobs", withAuth({ params })),
  getJob: (jobId) => client.get(`/platform/jobs/${jobId}`, withAuth()),
  applyToJob: (jobId, resumeFile) => {
    if (resumeFile) {
      const fd = new FormData();
      fd.append("resume", resumeFile);
      return client.post(`/platform/jobs/${jobId}/apply`, fd, withAuth({
        headers: { "Content-Type": "multipart/form-data" },
      }));
    }
    return client.post(`/platform/jobs/${jobId}/apply`, {}, withAuth());
  },

  // Student
  getStudentProfile: () => client.get("/platform/student/profile", withAuth()),
  uploadResume: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return client.post("/platform/resume/upload", fd, withAuth({
      headers: { "Content-Type": "multipart/form-data" },
    }));
  },
  listApplications: (params) => client.get("/platform/student/applications", withAuth({ params })),

  // Recruiter
  listRecruiterJobs: (params) => client.get("/platform/recruiter/jobs", withAuth({ params })),
  getRecruiterJob: (jobId) => client.get(`/platform/recruiter/jobs/${jobId}`, withAuth()),
  createJob: (formData) => client.post("/platform/recruiter/jobs", formData, withAuth({
    headers: { "Content-Type": "multipart/form-data" },
  })),
  updateJob: (jobId, formData) => client.patch(`/platform/recruiter/jobs/${jobId}`, formData, withAuth({
    headers: { "Content-Type": "multipart/form-data" },
  })),
  deleteJob: (jobId) => client.delete(`/platform/recruiter/jobs/${jobId}`, withAuth()),
  listApplicants: (jobId, params) => client.get(`/platform/recruiter/jobs/${jobId}/applicants`, withAuth({ params })),
  updateApplicationStatus: (applicationId, payload) =>
    client.patch(`/platform/recruiter/applications/${applicationId}/status`, payload, withAuth()),
  getAnalytics: () => client.get("/platform/recruiter/analytics", withAuth()),
};

export function getErrorMessage(error) {
  return error?.response?.data?.detail || error?.message || "Something went wrong";
}
