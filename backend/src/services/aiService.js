import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { env } from "../config/env.js";
import { AppError } from "../utils/helpers.js";

const client = axios.create({
  baseURL: env.aiServiceUrl,
  timeout: 120000,
});

async function aiRequest(method, path, data, config = {}) {
  try {
    const res = await client.request({ method, url: path, data, ...config });
    return res.data;
  } catch (err) {
    const detail = err.response?.data?.detail || err.message || "AI service unavailable";
    throw new AppError(detail, err.response?.status || 503);
  }
}

export async function parseResumeFile(buffer, filename) {
  const form = new FormData();
  form.append("file", buffer, { filename });
  return aiRequest("post", "/ai/parse-resume", form, { headers: form.getHeaders() });
}

export async function parseJdText(description) {
  return aiRequest("post", "/ai/parse-jd-text", { description });
}

export async function parseJdFile(buffer, filename) {
  const form = new FormData();
  form.append("file", buffer, { filename });
  return aiRequest("post", "/ai/parse-jd-file", form, { headers: form.getHeaders() });
}

export async function computeMatch({ resumeText, resumeSkills, jobText, jobSkills }) {
  return aiRequest("post", "/ai/compute-match", {
    resume_text: resumeText,
    resume_skills: resumeSkills,
    job_text: jobText,
    job_skills: jobSkills,
  });
}

export async function runSkillAnalysis(payload) {
  return aiRequest("post", "/ai/skill-analysis", payload);
}

export async function checkAiHealth() {
  try {
    const res = await client.get("/ai/health");
    return res.data;
  } catch {
    return { status: "down" };
  }
}

export function readDsaData() {
  const path = new URL("../../ai-engine/data/dsa_problems.json", import.meta.url);
  return JSON.parse(fs.readFileSync(path, "utf8"));
}
