import {
  Student,
  Recruiter,
  Job,
  Application,
  Resume,
  RecommendationHistory,
} from "../models/index.js";
import { AppError } from "../utils/helpers.js";
import { computeMatch, parseJdFile, parseJdText, parseResumeFile } from "./aiService.js";
import { uploadFile } from "./storageService.js";

function buildRecommendation(finalScore, missingSkills, roleTitle = "this role") {
  if (!missingSkills?.length) {
    return `You are ${finalScore}% fit for ${roleTitle}. Your skills align well — polish your portfolio and prepare for interviews.`;
  }
  const top = missingSkills.slice(0, 3).join(" + ");
  const potential = Math.min(99, Math.round(finalScore + missingSkills.length * 4));
  return `You are ${finalScore}% fit for ${roleTitle}. Learning ${top} can increase your match to ~${potential}%.`;
}

function buildApplicantSummary(matchedSkills, missingSkills, finalScore) {
  if (matchedSkills?.length && missingSkills?.length) {
    return `Candidate scores ${finalScore}% overall. Strong in ${matchedSkills.slice(0, 5).join(", ")} but lacks ${missingSkills.slice(0, 5).join(", ")} experience.`;
  }
  if (matchedSkills?.length) {
    return `Candidate scores ${finalScore}% with strong skills in ${matchedSkills.slice(0, 6).join(", ")}.`;
  }
  if (missingSkills?.length) {
    return `Candidate scores ${finalScore}% and is missing ${missingSkills.slice(0, 6).join(", ")}.`;
  }
  return `Candidate scores ${finalScore}% — limited skill overlap detected.`;
}

function lean(doc) {
  if (!doc) return doc;
  const { _id, __v, ...rest } = doc;
  return rest;
}

export async function getStudentByUser(userId) {
  const student = await Student.findOne({ user_id: userId }).lean();
  if (!student) throw new AppError("Student profile not found", 404);
  return student;
}

export async function getRecruiterByUser(userId) {
  const recruiter = await Recruiter.findOne({ user_id: userId }).lean();
  if (!recruiter) throw new AppError("Recruiter profile not found", 404);
  return recruiter;
}

export async function uploadStudentResume(user, file) {
  const student = await getStudentByUser(user.id);
  const parsed = await parseResumeFile(file.buffer, file.originalname);
  const { url } = await uploadFile(file.buffer, file.originalname, "resumes");

  const resumeDoc = await Resume.create({
    user_id: user.id,
    filename: file.originalname,
    resume_url: url,
    text: parsed.text,
    skills: parsed.skills,
    skill_levels: parsed.skill_levels || {},
  });

  const mergedSkills = [...new Set([...(student.skills || []), ...(parsed.skills || [])])];
  await Student.updateOne(
    { id: student.id },
    {
      $set: {
        resume_url: url,
        skills: mergedSkills,
        parsed_resume_data: {
          skills: parsed.skills,
          skill_levels: parsed.skill_levels,
          preview: (parsed.text || "").slice(0, 500),
        },
        updated_at: new Date().toISOString(),
      },
    }
  );

  await recalcStudentApplications(user.id);
  await refreshStudentRecommendations(student.id);

  return {
    resume_id: resumeDoc.id,
    resume_url: url,
    extracted_skills: parsed.skills,
    skill_levels: parsed.skill_levels,
    message: "Resume uploaded and applications re-scored successfully.",
  };
}

export async function recalcApplication(application, resume, job) {
  const jobSkills = [
    ...new Set([
      ...(job.required_skills || []),
      ...(job.preferred_skills || []),
      ...((job.parsed_jd_data?.skills) || []),
    ]),
  ];

  const match = await computeMatch({
    resumeText: resume.text || "",
    resumeSkills: resume.skills || [],
    jobText: job.description || "",
    jobSkills,
  });

  const aiRec = buildRecommendation(match.final_match_score, match.missing_skills, job.title);
  const update = {
    semantic_score: match.semantic_score,
    tfidf_score: match.tfidf_score,
    skill_match_score: match.skill_match_score,
    final_match_score: match.final_match_score,
    matched_skills: match.matched_skills,
    missing_skills: match.missing_skills,
    ai_recommendation: aiRec,
    learning_roadmap: aiRec,
    ai_summary: buildApplicantSummary(match.matched_skills, match.missing_skills, match.final_match_score),
    parsed_resume_data: {
      skills: resume.skills,
      skill_levels: resume.skill_levels,
      text_preview: (resume.text || "").slice(0, 500),
    },
    updated_at: new Date().toISOString(),
  };

  await Application.updateOne({ id: application.id }, { $set: update });
  await RecommendationHistory.create({
    user_id: resume.user_id,
    job_id: job.id,
    application_id: application.id,
    final_match_score: match.final_match_score,
    missing_skills: match.missing_skills,
    recommendation: aiRec,
    source: "recalc",
  });

  return { ...application, ...update };
}

export async function recalcStudentApplications(userId) {
  const resume = await Resume.findOne({ user_id: userId }).sort({ created_at: -1 }).lean();
  if (!resume) return 0;
  const student = await Student.findOne({ user_id: userId }).lean();
  const apps = await Application.find({ student_id: student.id }).lean();
  for (const app of apps) {
    const job = await Job.findOne({ id: app.job_id }).lean();
    if (job) await recalcApplication(app, resume, job);
  }
  return apps.length;
}

export async function recalcJobApplications(jobId) {
  const job = await Job.findOne({ id: jobId }).lean();
  if (!job) return 0;
  const apps = await Application.find({ job_id: jobId }).lean();
  for (const app of apps) {
    const student = await Student.findOne({ id: app.student_id }).lean();
    const resume = await Resume.findOne({ user_id: student?.user_id }).sort({ created_at: -1 }).lean();
    if (resume) await recalcApplication(app, resume, job);
  }
  return apps.length;
}

export async function refreshStudentRecommendations(studentId) {
  const student = await Student.findOne({ id: studentId }).lean();
  const resume = await Resume.findOne({ user_id: student.user_id }).sort({ created_at: -1 }).lean();
  if (!resume) return [];

  const jobs = await Job.find({ status: "active" }).sort({ created_at: -1 }).limit(20).lean();
  const recs = [];

  for (const job of jobs) {
    const jobSkills = [
      ...new Set([
        ...(job.required_skills || []),
        ...(job.preferred_skills || []),
        ...((job.parsed_jd_data?.skills) || []),
      ]),
    ];
    const match = await computeMatch({
      resumeText: resume.text,
      resumeSkills: resume.skills,
      jobText: job.description,
      jobSkills,
    });
    recs.push({
      job_id: job.id,
      title: job.title,
      company_name: job.company_name,
      final_match_score: match.final_match_score,
      job_type: job.job_type,
    });
  }

  recs.sort((a, b) => b.final_match_score - a.final_match_score);
  await Student.updateOne({ id: studentId }, { $set: { recommended_jobs: recs.slice(0, 20) } });
  return recs.slice(0, 20);
}

export async function applyToJob(user, jobId, resumeFile = null) {
  if (resumeFile) {
    await uploadStudentResume(user, resumeFile);
  }

  const student = await getStudentByUser(user.id);
  const job = await Job.findOne({ id: jobId, status: "active" }).lean();
  if (!job) throw new AppError("Job not found.", 404);

  const existing = await Application.findOne({ student_id: student.id, job_id: jobId }).lean();
  if (existing) throw new AppError("Already applied to this job.", 400);

  const resume = await Resume.findOne({ user_id: user.id }).sort({ created_at: -1 }).lean();
  if (!resume) throw new AppError("Upload resume before applying.", 400);

  const jobSkills = [
    ...new Set([
      ...(job.required_skills || []),
      ...(job.preferred_skills || []),
      ...((job.parsed_jd_data?.skills) || []),
    ]),
  ];

  const match = await computeMatch({
    resumeText: resume.text,
    resumeSkills: resume.skills,
    jobText: job.description,
    jobSkills,
  });

  const aiRec = buildRecommendation(match.final_match_score, match.missing_skills, job.title);
  const application = await Application.create({
    student_id: student.id,
    job_id: job.id,
    recruiter_id: job.recruiter_id,
    resume_url: resume.resume_url || student.resume_url,
    parsed_resume_data: {
      skills: resume.skills,
      skill_levels: resume.skill_levels,
      text_preview: (resume.text || "").slice(0, 500),
    },
    semantic_score: match.semantic_score,
    tfidf_score: match.tfidf_score,
    skill_match_score: match.skill_match_score,
    final_match_score: match.final_match_score,
    matched_skills: match.matched_skills,
    missing_skills: match.missing_skills,
    ai_recommendation: aiRec,
    learning_roadmap: aiRec,
    ai_summary: buildApplicantSummary(match.matched_skills, match.missing_skills, match.final_match_score),
    application_status: "applied",
  });

  await Job.updateOne({ id: jobId }, { $addToSet: { applicants: application.id } });
  await Student.updateOne({ id: student.id }, { $addToSet: { applied_jobs: jobId } });
  await RecommendationHistory.create({
    user_id: user.id,
    job_id: jobId,
    application_id: application.id,
    final_match_score: match.final_match_score,
    missing_skills: match.missing_skills,
    recommendation: aiRec,
    source: "application",
  });

  return { message: "Applied successfully.", application: lean(application.toObject()), job: lean(job) };
}

export async function getJobById(jobId, user) {
  const job = await Job.findOne({ id: jobId, status: "active" }).lean();
  if (!job) throw new AppError("Job not found.", 404);

  const result = lean(job);
  if (user?.role === "student") {
    const student = await Student.findOne({ user_id: user.id }).lean();
    const resume = student ? await Resume.findOne({ user_id: user.id }).sort({ created_at: -1 }).lean() : null;
    if (resume) {
      const jobSkills = [
        ...new Set([
          ...(job.required_skills || []),
          ...(job.preferred_skills || []),
          ...((job.parsed_jd_data?.skills) || []),
        ]),
      ];
      try {
        const match = await computeMatch({
          resumeText: resume.text,
          resumeSkills: resume.skills,
          jobText: job.description,
          jobSkills,
        });
        result.recommended_match_score = match.final_match_score;
        result.preview_semantic_score = match.semantic_score;
        result.preview_tfidf_score = match.tfidf_score;
        result.preview_skill_score = match.skill_match_score;
      } catch {
        result.recommended_match_score = 0;
      }
    }
    const existing = student
      ? await Application.findOne({ student_id: student.id, job_id: jobId }).lean()
      : null;
    result.already_applied = Boolean(existing);
  }
  return result;
}

export async function getStudentApplications(user, query) {
  const student = await getStudentByUser(user.id);
  const filter = { student_id: student.id };
  if (query.status) filter.application_status = query.status;

  const page = parseInt(query.page || "1", 10);
  const limit = parseInt(query.limit || "20", 10);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Application.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).lean(),
    Application.countDocuments(filter),
  ]);

  const jobIds = [...new Set(items.map((a) => a.job_id))];
  const jobs = await Job.find({ id: { $in: jobIds } }).lean();
  const jobMap = Object.fromEntries(jobs.map((j) => [j.id, j]));

  const enriched = items.map((app) => {
    const job = jobMap[app.job_id];
    return {
      ...lean(app),
      job: job
        ? {
            id: job.id,
            title: job.title,
            company_name: job.company_name,
            location: job.location,
            work_mode: job.work_mode,
            job_type: job.job_type,
          }
        : null,
    };
  });

  return { items: enriched, total, page, limit };
}

export async function getRecruiterJobsWithStats(user, query) {
  const recruiter = await getRecruiterByUser(user.id);
  const page = parseInt(query.page || "1", 10);
  const limit = parseInt(query.limit || "20", 10);
  const skip = (page - 1) * limit;

  const [jobs, total] = await Promise.all([
    Job.find({ recruiter_id: recruiter.id }).sort({ created_at: -1 }).skip(skip).limit(limit).lean(),
    Job.countDocuments({ recruiter_id: recruiter.id }),
  ]);

  const jobIds = jobs.map((j) => j.id);
  const stats = await Application.aggregate([
    { $match: { job_id: { $in: jobIds } } },
    {
      $group: {
        _id: "$job_id",
        applicant_count: { $sum: 1 },
        avg_match_score: { $avg: "$final_match_score" },
        top_score: { $max: "$final_match_score" },
      },
    },
  ]);
  const statsMap = Object.fromEntries(stats.map((s) => [s._id, s]));

  const items = jobs.map((job) => ({
    ...lean(job),
    applicant_count: statsMap[job.id]?.applicant_count || 0,
    avg_match_score: Math.round((statsMap[job.id]?.avg_match_score || 0) * 100) / 100,
    top_match_score: statsMap[job.id]?.top_score || 0,
  }));

  return { items, total, page, limit };
}

export async function getRecruiterJob(user, jobId) {
  const recruiter = await getRecruiterByUser(user.id);
  const job = await Job.findOne({ id: jobId, recruiter_id: recruiter.id }).lean();
  if (!job) throw new AppError("Job not found.", 404);
  const applicantCount = await Application.countDocuments({ job_id: jobId });
  return { ...lean(job), applicant_count: applicantCount };
}

export async function createJob(user, payload, jdFile) {
  const recruiter = await getRecruiterByUser(user.id);
  let parsedJdData = {};
  let uploadedJdFile = "";
  let required = payload.required_skills || [];

  if (jdFile) {
    parsedJdData = await parseJdFile(jdFile.buffer, jdFile.originalname);
    const uploaded = await uploadFile(jdFile.buffer, jdFile.originalname, "job-descriptions");
    uploadedJdFile = uploaded.url;
    required = [...new Set([...required, ...(parsedJdData.skills || [])])];
  } else {
    parsedJdData = await parseJdText(payload.description);
    required = [...new Set([...required, ...(parsedJdData.skills || [])])];
  }

  const job = await Job.create({
    recruiter_id: recruiter.id,
    title: payload.title,
    company_name: payload.company_name,
    description: payload.description,
    required_skills: required,
    preferred_skills: payload.preferred_skills || [],
    minimum_cgpa: payload.minimum_cgpa,
    stipend: payload.stipend || "",
    salary: payload.salary || "",
    location: payload.location || "",
    work_mode: payload.work_mode || "onsite",
    job_type: payload.job_type || "full-time",
    joining_date: payload.joining_date,
    application_deadline: payload.application_deadline,
    experience_required: payload.experience_required || "",
    openings: payload.openings || 1,
    status: payload.status || "active",
    uploaded_jd_file: uploadedJdFile,
    parsed_jd_data: parsedJdData,
  });

  await Recruiter.updateOne({ id: recruiter.id }, { $addToSet: { posted_jobs: job.id } });
  return { message: "Job created.", job: lean(job.toObject()) };
}

export async function updateJob(user, jobId, payload, jdFile) {
  const recruiter = await getRecruiterByUser(user.id);
  const job = await Job.findOne({ id: jobId, recruiter_id: recruiter.id }).lean();
  if (!job) throw new AppError("Job not found.", 404);

  let parsedJdData = job.parsed_jd_data || {};
  let uploadedJdFile = job.uploaded_jd_file || "";
  let required = payload.required_skills || job.required_skills || [];

  if (jdFile) {
    parsedJdData = await parseJdFile(jdFile.buffer, jdFile.originalname);
    const uploaded = await uploadFile(jdFile.buffer, jdFile.originalname, "job-descriptions");
    uploadedJdFile = uploaded.url;
    required = [...new Set([...required, ...(parsedJdData.skills || [])])];
  } else if (payload.description) {
    parsedJdData = await parseJdText(payload.description);
    required = [...new Set([...required, ...(parsedJdData.skills || [])])];
  }

  const update = {
    title: payload.title ?? job.title,
    company_name: payload.company_name ?? job.company_name,
    description: payload.description ?? job.description,
    required_skills: required,
    preferred_skills: payload.preferred_skills ?? job.preferred_skills,
    minimum_cgpa: payload.minimum_cgpa ?? job.minimum_cgpa,
    stipend: payload.stipend ?? job.stipend,
    salary: payload.salary ?? job.salary,
    location: payload.location ?? job.location,
    work_mode: payload.work_mode ?? job.work_mode,
    job_type: payload.job_type ?? job.job_type,
    joining_date: payload.joining_date ?? job.joining_date,
    application_deadline: payload.application_deadline ?? job.application_deadline,
    experience_required: payload.experience_required ?? job.experience_required,
    openings: payload.openings ?? job.openings,
    status: payload.status ?? job.status,
    parsed_jd_data: parsedJdData,
    uploaded_jd_file: uploadedJdFile,
    updated_at: new Date().toISOString(),
  };

  await Job.updateOne({ id: jobId }, { $set: update });
  const recalcCount = await recalcJobApplications(jobId);
  return { message: "Job updated.", recalculated_applications: recalcCount };
}

export async function findJobs(user, query) {
  const filter = { status: "active" };
  if (query.q) {
    filter.$or = [
      { title: { $regex: query.q, $options: "i" } },
      { company_name: { $regex: query.q, $options: "i" } },
      { required_skills: { $elemMatch: { $regex: query.q, $options: "i" } } },
    ];
  }
  if (query.job_type) filter.job_type = query.job_type;
  if (query.work_mode) filter.work_mode = query.work_mode;
  if (query.location) filter.location = { $regex: query.location, $options: "i" };

  const page = parseInt(query.page || "1", 10);
  const limit = parseInt(query.limit || "10", 10);
  const skip = (page - 1) * limit;

  const [jobs, total] = await Promise.all([
    Job.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).lean(),
    Job.countDocuments(filter),
  ]);

  const recommendationMap = {};
  if (user.role === "student") {
    const student = await Student.findOne({ user_id: user.id }).lean();
    for (const item of student?.recommended_jobs || []) {
      recommendationMap[item.job_id] = item.final_match_score || 0;
    }
  }

  let items = jobs.map((job) => ({
    ...lean(job),
    recommended_match_score: recommendationMap[job.id] || 0,
  }));

  if (user.role === "student") {
    const student = await Student.findOne({ user_id: user.id }).lean();
    if (student) {
      const applied = await Application.find({ student_id: student.id, job_id: { $in: jobs.map((j) => j.id) } }).lean();
      const appliedSet = new Set(applied.map((a) => a.job_id));
      items = items.map((j) => ({ ...j, already_applied: appliedSet.has(j.id) }));
    }
  }

  const minMatch = parseFloat(query.min_match || "0");
  items = items.filter((j) => j.recommended_match_score >= minMatch);
  if (query.sort_by === "match") {
    items.sort((a, b) => b.recommended_match_score - a.recommended_match_score);
  }

  return { items, total, page, limit };
}

export async function getRecruiterAnalytics(user) {
  const recruiter = await getRecruiterByUser(user.id);
  const apps = await Application.find({ recruiter_id: recruiter.id }).lean();
  const jobs = await Job.find({ recruiter_id: recruiter.id }).lean();

  const funnelMap = {};
  for (const app of apps) {
    funnelMap[app.application_status] = (funnelMap[app.application_status] || 0) + 1;
  }
  const hiring_funnel = Object.entries(funnelMap).map(([_id, count]) => ({ _id, count }));

  const skillMap = {};
  for (const app of apps) {
    for (const skill of app.missing_skills || []) {
      skillMap[skill] = (skillMap[skill] || 0) + 1;
    }
  }
  const skill_distribution = Object.entries(skillMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([_id, count]) => ({ _id, count }));

  const avg = apps.length
    ? apps.reduce((s, a) => s + (a.final_match_score || 0), 0) / apps.length
    : 0;

  const top_candidates = [...apps]
    .sort((a, b) => (b.final_match_score || 0) - (a.final_match_score || 0))
    .slice(0, 5);

  const enrichedTop = [];
  for (const app of top_candidates) {
    const student = await Student.findOne({ id: app.student_id }).lean();
    const job = await Job.findOne({ id: app.job_id }).lean();
    enrichedTop.push({
      application_id: app.id,
      student_id: app.student_id,
      student_name: student?.degree ? `${student.degree} @ ${student.college_name}` : app.student_id,
      job_id: app.job_id,
      job_title: job?.title,
      final_match_score: app.final_match_score,
      application_status: app.application_status,
    });
  }

  const match_distribution = await Application.aggregate([
    { $match: { recruiter_id: recruiter.id } },
    {
      $bucket: {
        groupBy: "$final_match_score",
        boundaries: [0, 40, 60, 75, 90, 101],
        default: "Other",
        output: { count: { $sum: 1 } },
      },
    },
  ]);

  const job_stats = await Job.aggregate([
    { $match: { recruiter_id: recruiter.id } },
    {
      $lookup: {
        from: "applications",
        localField: "id",
        foreignField: "job_id",
        as: "apps",
      },
    },
    {
      $project: {
        id: 1,
        title: 1,
        status: 1,
        applicant_count: { $size: "$apps" },
        avg_match: { $avg: "$apps.final_match_score" },
      },
    },
    { $sort: { applicant_count: -1 } },
    { $limit: 10 },
  ]);

  return {
    kpis: {
      total_jobs: jobs.length,
      active_jobs: jobs.filter((j) => j.status === "active").length,
      total_applicants: apps.length,
      avg_match_score: Math.round(avg * 100) / 100,
    },
    hiring_funnel,
    top_candidates: enrichedTop,
    skill_distribution,
    match_distribution,
    job_stats,
  };
}

export { lean };
