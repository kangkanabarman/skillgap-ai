import { Router } from "express";
import multer from "multer";
import * as auth from "../services/authService.js";
import * as platform from "../services/platformService.js";
import * as legacy from "../services/legacyService.js";
import { parseResumeFile } from "../services/aiService.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { Application, Job, Recruiter, Student } from "../models/index.js";
import { AppError } from "../utils/helpers.js";
import { APPLICATION_STATUSES } from "../constants/index.js";
import { lean } from "../services/platformService.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: "SkillGap AI API", status: "running", version: "2.0" });
});

router.post("/auth/register", async (req, res) => {
  res.json(await auth.register(req.body));
});

router.post("/auth/login", async (req, res) => {
  res.json(await auth.login(req.body));
});

router.get("/profile", authenticate, async (req, res) => {
  res.json(await auth.getProfile(req.user.id));
});

router.post("/resume/upload", authenticate, upload.single("file"), async (req, res) => {
  if (!req.file) throw new AppError("File required", 400);
  const parsed = await parseResumeFile(req.file.buffer, req.file.originalname);
  res.json(await legacy.uploadLegacyResume(req.user.id, {
    filename: req.file.originalname,
    ...parsed,
  }));
});

router.post("/skill-analysis", authenticate, async (req, res) => {
  res.json(await legacy.createSkillAnalysis(req.user.id, req.body));
});

router.get("/skill-analyses", authenticate, async (req, res) => {
  res.json(await legacy.listSkillAnalyses(req.user.id));
});

router.get("/career-test/questions", (_req, res) => {
  res.json(legacy.getCareerQuestions());
});

router.post("/career-test/submit", authenticate, async (req, res) => {
  res.json(await legacy.submitCareerTest(req.user.id, req.body.answers));
});

router.get("/career-test/results", authenticate, async (req, res) => {
  res.json(await legacy.getCareerResults(req.user.id));
});

router.get("/news/jobs", async (req, res) => {
  res.json(await legacy.getJobNews(parseInt(req.query.count || "15", 10)));
});

router.get("/dsa/periods", (_req, res) => res.json(legacy.getDsaPeriods()));
router.get("/dsa/companies", (_req, res) => res.json(legacy.getDsaCompanies()));
router.get("/dsa/topics", (req, res) => {
  res.json(legacy.getDsaTopics(req.query.company, req.query.period));
});
router.get("/dsa/problems", (req, res) => {
  res.json(legacy.getDsaProblems(req.query.company, req.query.topic, req.query.period));
});
router.get("/dsa/all", (req, res) => res.json(legacy.getDsaData(req.query.period)));

// Platform routes
router.post("/platform/resume/upload", authenticate, requireRole("student"), upload.single("file"), async (req, res) => {
  if (!req.file) throw new AppError("File required", 400);
  res.json(await platform.uploadStudentResume(req.user, req.file));
});

router.get("/platform/student/profile", authenticate, requireRole("student"), async (req, res) => {
  const student = await platform.getStudentByUser(req.user.id);
  res.json({ user: req.user, student: lean(student) });
});

router.patch("/platform/student/profile", authenticate, requireRole("student"), async (req, res) => {
  const student = await platform.getStudentByUser(req.user.id);
  const allowed = ["college_name", "degree", "branch", "graduation_year", "cgpa", "skills", "certifications", "projects"];
  const update = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) update[key] = req.body[key];
  }
  update.updated_at = new Date().toISOString();
  await Student.updateOne({ id: student.id }, { $set: update });
  res.json({ message: "Student profile updated." });
});

router.get("/platform/student/applications", authenticate, requireRole("student"), async (req, res) => {
  res.json(await platform.getStudentApplications(req.user, req.query));
});

router.get("/platform/jobs/:jobId", authenticate, async (req, res) => {
  res.json(await platform.getJobById(req.params.jobId, req.user));
});

router.get("/platform/jobs", authenticate, async (req, res) => {
  res.json(await platform.findJobs(req.user, req.query));
});

router.get("/platform/jobs/recommended", authenticate, requireRole("student"), async (req, res) => {
  const student = await platform.getStudentByUser(req.user.id);
  let recs = student.recommended_jobs || [];
  if (!recs.length) recs = await platform.refreshStudentRecommendations(student.id);
  res.json({ items: recs });
});

router.post("/platform/jobs/:jobId/apply", authenticate, requireRole("student"), upload.single("resume"), async (req, res) => {
  res.json(await platform.applyToJob(req.user, req.params.jobId, req.file));
});

router.get("/platform/recruiter/profile", authenticate, requireRole("recruiter"), async (req, res) => {
  const recruiter = await platform.getRecruiterByUser(req.user.id);
  res.json({ user: req.user, recruiter: lean(recruiter) });
});

router.patch("/platform/recruiter/profile", authenticate, requireRole("recruiter"), async (req, res) => {
  const recruiter = await platform.getRecruiterByUser(req.user.id);
  const allowed = ["company_name", "company_website", "company_description", "recruiter_role"];
  const update = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) update[key] = req.body[key];
  }
  update.updated_at = new Date().toISOString();
  await Recruiter.updateOne({ id: recruiter.id }, { $set: update });
  res.json({ message: "Recruiter profile updated." });
});

router.post("/platform/recruiter/jobs", authenticate, requireRole("recruiter"), upload.single("jd_file"), async (req, res) => {
  const payload = JSON.parse(req.body.payload_json || "{}");
  res.json(await platform.createJob(req.user, payload, req.file));
});

router.get("/platform/recruiter/jobs", authenticate, requireRole("recruiter"), async (req, res) => {
  res.json(await platform.getRecruiterJobsWithStats(req.user, req.query));
});

router.get("/platform/recruiter/jobs/:jobId", authenticate, requireRole("recruiter"), async (req, res) => {
  res.json(await platform.getRecruiterJob(req.user, req.params.jobId));
});

router.patch("/platform/recruiter/jobs/:jobId", authenticate, requireRole("recruiter"), upload.single("jd_file"), async (req, res) => {
  const payload = JSON.parse(req.body.payload_json || "{}");
  res.json(await platform.updateJob(req.user, req.params.jobId, payload, req.file));
});

router.delete("/platform/recruiter/jobs/:jobId", authenticate, requireRole("recruiter"), async (req, res) => {
  const recruiter = await platform.getRecruiterByUser(req.user.id);
  const result = await Job.deleteOne({ id: req.params.jobId, recruiter_id: recruiter.id });
  if (!result.deletedCount) throw new AppError("Job not found.", 404);
  await Application.deleteMany({ job_id: req.params.jobId });
  res.json({ message: "Job deleted." });
});

router.get("/platform/recruiter/jobs/:jobId/applicants", authenticate, requireRole("recruiter"), async (req, res) => {
  const recruiter = await platform.getRecruiterByUser(req.user.id);
  const job = await Job.findOne({ id: req.params.jobId, recruiter_id: recruiter.id }).lean();
  if (!job) throw new AppError("Job not found.", 404);

  const filter = { job_id: req.params.jobId };
  if (req.query.status) filter.application_status = req.query.status;
  const page = parseInt(req.query.page || "1", 10);
  const limit = parseInt(req.query.limit || "20", 10);
  const skip = (page - 1) * limit;
  const sortField = req.query.sort_by === "latest" ? { created_at: -1 } : { final_match_score: -1 };

  const [apps, total] = await Promise.all([
    Application.find(filter).sort(sortField).skip(skip).limit(limit).lean(),
    Application.countDocuments(filter),
  ]);

  for (const app of apps) {
    const student = await Student.findOne({ id: app.student_id }).lean();
    app.student_snapshot = {
      id: student?.id || "",
      cgpa: student?.cgpa,
      college_name: student?.college_name,
      degree: student?.degree,
      skills: (student?.skills || []).slice(0, 15),
    };
  }

  res.json({ items: apps.map(lean), total, page, limit });
});

router.patch("/platform/recruiter/applications/:applicationId/status", authenticate, requireRole("recruiter"), async (req, res) => {
  const recruiter = await platform.getRecruiterByUser(req.user.id);
  const appDoc = await Application.findOne({ id: req.params.applicationId }).lean();
  if (!appDoc) throw new AppError("Application not found.", 404);
  if (appDoc.recruiter_id !== recruiter.id) throw new AppError("You cannot update this application.", 403);
  if (!APPLICATION_STATUSES.includes(req.body.application_status)) {
    throw new AppError("Invalid status value.", 400);
  }
  await Application.updateOne(
    { id: req.params.applicationId },
    {
      $set: {
        application_status: req.body.application_status,
        recruiter_notes: req.body.recruiter_notes || "",
        updated_at: new Date().toISOString(),
      },
    }
  );
  res.json({ message: "Application status updated." });
});

router.get("/platform/recruiter/analytics", authenticate, requireRole("recruiter"), async (req, res) => {
  res.json(await platform.getRecruiterAnalytics(req.user));
});

export default router;
