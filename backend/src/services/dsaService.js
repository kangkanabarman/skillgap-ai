import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.resolve(__dirname, "../data/company_wise_dsa.json");
export const DEFAULT_PERIOD = "5. All";

let rawCache = null;
/** @type {Map<string, object[]>} */
const flatCache = new Map();

function loadRaw() {
  if (!rawCache) {
    rawCache = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  }
  return rawCache;
}

export function getDsaPeriods() {
  const raw = loadRaw();
  const first = Object.values(raw)[0];
  if (!first?.sheets) return [DEFAULT_PERIOD];
  return Object.keys(first.sheets).sort();
}

export function getDsaCompanies() {
  return Object.keys(loadRaw()).sort((a, b) => a.localeCompare(b));
}

function normalizeProblem(problem, companyName) {
  return {
    title: problem.title,
    url: problem.link,
    difficulty: problem.difficulty,
    topics: problem.topics || [],
    companies: [companyName],
    frequency: problem.frequency,
    acceptance_rate: problem.acceptance_rate,
  };
}

export function getDsaAll(period = DEFAULT_PERIOD) {
  if (flatCache.has(period)) return flatCache.get(period);

  const raw = loadRaw();
  const problems = [];
  const seen = new Set();

  for (const [key, entry] of Object.entries(raw)) {
    const companyName = entry.company || key;
    const sheet = entry.sheets?.[period];
    if (!sheet?.problems?.length) continue;

    for (const p of sheet.problems) {
      const url = p.link;
      if (!url) continue;
      const dedupeKey = `${companyName}|${url}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      problems.push(normalizeProblem(p, companyName));
    }
  }

  flatCache.set(period, problems);
  return problems;
}

export function getDsaTopics(company, period = DEFAULT_PERIOD) {
  const topics = new Set();
  for (const p of getDsaAll(period)) {
    if (!p.companies?.includes(company)) continue;
    for (const t of p.topics || []) topics.add(t);
  }
  return [...topics].sort();
}

export function getDsaProblems(company, topic, period = DEFAULT_PERIOD) {
  return getDsaAll(period).filter((p) => {
    if (!p.companies?.includes(company)) return false;
    if (topic && !p.topics?.includes(topic)) return false;
    return true;
  });
}
