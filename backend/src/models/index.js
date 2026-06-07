import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const userSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => uuidv4(), unique: true, index: true },
    name: { type: String, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    role: { type: String, enum: ["student", "recruiter"], default: "student", index: true },
    created_at: { type: Date, default: Date.now },
  },
  { versionKey: false, strict: false }
);

export const User = mongoose.model("User", userSchema, "users");

const studentSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => uuidv4(), unique: true, index: true },
    user_id: { type: String, required: true, unique: true, index: true },
    college_name: { type: String, default: "" },
    degree: { type: String, default: "" },
    branch: { type: String, default: "" },
    graduation_year: { type: Number, default: null },
    cgpa: { type: Number, default: null },
    skills: { type: [String], default: [] },
    certifications: { type: [String], default: [] },
    projects: { type: [String], default: [] },
    resume_url: { type: String, default: "" },
    parsed_resume_data: { type: mongoose.Schema.Types.Mixed, default: {} },
    recommended_jobs: { type: [mongoose.Schema.Types.Mixed], default: [] },
    applied_jobs: { type: [String], default: [] },
    learning_recommendations: { type: [mongoose.Schema.Types.Mixed], default: [] },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { versionKey: false, strict: false }
);

export const Student = mongoose.model("Student", studentSchema, "students");

const recruiterSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => uuidv4(), unique: true, index: true },
    user_id: { type: String, required: true, unique: true, index: true },
    company_name: { type: String, default: "" },
    company_website: { type: String, default: "" },
    company_description: { type: String, default: "" },
    recruiter_role: { type: String, default: "" },
    company_logo: { type: String, default: "" },
    posted_jobs: { type: [String], default: [] },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { versionKey: false, strict: false }
);

export const Recruiter = mongoose.model("Recruiter", recruiterSchema, "recruiters");

const jobSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => uuidv4(), unique: true, index: true },
    recruiter_id: { type: String, required: true, index: true },
    title: { type: String, required: true, index: true },
    company_name: { type: String, required: true },
    description: { type: String, default: "" },
    required_skills: { type: [String], default: [], index: true },
    preferred_skills: { type: [String], default: [] },
    minimum_cgpa: { type: Number, default: null },
    stipend: { type: String, default: "" },
    salary: { type: String, default: "" },
    location: { type: String, default: "" },
    work_mode: { type: String, default: "onsite" },
    job_type: { type: String, default: "full-time" },
    joining_date: { type: String, default: null },
    application_deadline: { type: String, default: null },
    experience_required: { type: String, default: "" },
    openings: { type: Number, default: 1 },
    status: { type: String, default: "active", index: true },
    uploaded_jd_file: { type: String, default: "" },
    parsed_jd_data: { type: mongoose.Schema.Types.Mixed, default: {} },
    applicants: { type: [String], default: [] },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { versionKey: false, strict: false }
);

export const Job = mongoose.model("Job", jobSchema, "jobs");

const applicationSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => uuidv4(), unique: true, index: true },
    student_id: { type: String, required: true, index: true },
    job_id: { type: String, required: true, index: true },
    recruiter_id: { type: String, required: true, index: true },
    resume_url: { type: String, default: "" },
    parsed_resume_data: { type: mongoose.Schema.Types.Mixed, default: {} },
    semantic_score: { type: Number, default: 0 },
    tfidf_score: { type: Number, default: 0 },
    skill_match_score: { type: Number, default: 0 },
    final_match_score: { type: Number, default: 0, index: true },
    matched_skills: { type: [String], default: [] },
    missing_skills: { type: [String], default: [] },
    ai_recommendation: { type: String, default: "" },
    learning_roadmap: { type: String, default: "" },
    learning_resources: { type: mongoose.Schema.Types.Mixed, default: {} },
    ai_summary: { type: String, default: "" },
    application_status: { type: String, default: "applied", index: true },
    recruiter_notes: { type: String, default: "" },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { versionKey: false, strict: false }
);

applicationSchema.index({ student_id: 1, job_id: 1 }, { unique: true });
export const Application = mongoose.model("Application", applicationSchema, "applications");

const resumeSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => uuidv4(), unique: true, index: true },
    user_id: { type: String, required: true, index: true },
    filename: { type: String, default: "" },
    resume_url: { type: String, default: "" },
    text: { type: String, default: "" },
    skills: { type: [String], default: [] },
    skill_levels: { type: mongoose.Schema.Types.Mixed, default: {} },
    created_at: { type: Date, default: Date.now },
  },
  { versionKey: false, strict: false }
);

export const Resume = mongoose.model("Resume", resumeSchema, "resumes");

const skillAnalysisSchema = new mongoose.Schema({}, { strict: false });
export const SkillAnalysis = mongoose.model("SkillAnalysis", skillAnalysisSchema, "skill_analyses");

const recommendationHistorySchema = new mongoose.Schema(
  {
    id: { type: String, default: () => uuidv4(), unique: true },
    user_id: { type: String, required: true, index: true },
    job_id: { type: String, default: "" },
    application_id: { type: String, default: "" },
    final_match_score: Number,
    missing_skills: [String],
    recommendation: String,
    source: { type: String, default: "application" },
    created_at: { type: Date, default: Date.now },
  },
  { versionKey: false, strict: false }
);
export const RecommendationHistory = mongoose.model("RecommendationHistory", recommendationHistorySchema, "recommendation_history");

const careerTestSchema = new mongoose.Schema({}, { strict: false });
export const CareerTestResult = mongoose.model("CareerTestResult", careerTestSchema, "career_test_results");

export { Resume as ResumeAnalysis };
