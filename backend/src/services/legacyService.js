import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { CareerTestResult, Resume, SkillAnalysis } from "../models/index.js";
import * as dsaService from "./dsaService.js";
import { CAREER_PATHS, CAREER_QUESTIONS } from "../constants/index.js";
import { env } from "../config/env.js";
import { runSkillAnalysis } from "./aiService.js";

function analyzeCareerPath(answers) {
  const scores = { backend: 0, data: 0, frontend: 0, product: 0 };
  const map = ["backend", "data", "frontend", "product"];
  for (const a of answers) {
    const idx = map.indexOf(a.answer?.toLowerCase?.()) >= 0
      ? map.indexOf(a.answer.toLowerCase())
      : parseInt(a.answer, 10);
    if (idx >= 0 && idx < 4) scores[map[idx]] += 1;
  }
  const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  return {
    career_path: CAREER_PATHS[top],
    explanation: `Based on your responses, you show strong alignment with ${CAREER_PATHS[top]}. Focus on building portfolio projects and deepening core skills in this track.`,
  };
}

export function getCareerQuestions() {
  return CAREER_QUESTIONS;
}

export async function submitCareerTest(userId, answers) {
  const result = analyzeCareerPath(answers);
  const doc = await CareerTestResult.create({
    id: uuidv4(),
    user_id: userId,
    answers,
    career_path: result.career_path,
    explanation: result.explanation,
    created_at: new Date().toISOString(),
  });
  return doc;
}

export async function getCareerResults(userId) {
  return CareerTestResult.find({ user_id: userId }).sort({ created_at: -1 }).lean();
}

export function getDsaPeriods() {
  return dsaService.getDsaPeriods();
}

export function getDsaData(period) {
  return dsaService.getDsaAll(period);
}

export function getDsaCompanies() {
  return dsaService.getDsaCompanies();
}

export function getDsaTopics(company, period) {
  return dsaService.getDsaTopics(company, period);
}

export function getDsaProblems(company, topic, period) {
  return dsaService.getDsaProblems(company, topic, period);
}

export async function getJobNews(count = 15) {
  if (!env.gnewsApiKey) {
    return { articles: [], message: "Configure GNEWS_API_KEY for live news" };
  }
  const res = await axios.get("https://gnews.io/api/v4/search", {
    params: {
      q: "hiring OR recruitment OR jobs",
      lang: "en",
      max: count,
      apikey: env.gnewsApiKey,
    },
  });
  return { articles: res.data.articles || [] };
}

export async function createSkillAnalysis(userId, { company, role }) {
  const resume = await Resume.findOne({ user_id: userId }).sort({ created_at: -1 }).lean();
  if (!resume) throw new Error("No resume found. Upload a resume first.");

  const analysis = await runSkillAnalysis({
    company,
    role,
    resume_text: resume.text,
    resume_skills: resume.skills,
    user_id: userId,
    resume_id: resume.id,
  });

  const doc = await SkillAnalysis.create({ id: uuidv4(), user_id: userId, ...analysis });
  return doc;
}

export async function listSkillAnalyses(userId) {
  return SkillAnalysis.find({ user_id: userId }).sort({ created_at: -1 }).lean();
}

export async function uploadLegacyResume(userId, parsed) {
  const doc = await Resume.create({
    user_id: userId,
    filename: parsed.filename,
    text: parsed.text,
    skills: parsed.skills,
    skill_levels: parsed.skill_levels || {},
  });
  return {
    resume_id: doc.id,
    extracted_text: parsed.text,
    extracted_skills: parsed.skills,
    skill_levels: parsed.skill_levels,
  };
}
