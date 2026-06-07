export const APPLICATION_STATUSES = [
  "applied",
  "shortlisted",
  "under_review",
  "rejected",
  "selected",
];

export const USER_ROLES = ["student", "recruiter"];

export const JOB_TYPES = ["internship", "full-time", "part-time", "contract"];

export const WORK_MODES = ["remote", "hybrid", "onsite"];

export const CAREER_PATHS = {
  backend: "Backend/Full-Stack Development",
  data: "Data Science & Analytics",
  frontend: "Frontend Development",
  product: "Product Management",
};

export const CAREER_QUESTIONS = [
  { id: 1, question: "Which activity excites you most?", options: ["Building APIs", "Analyzing datasets", "Designing UI", "Planning features"] },
  { id: 2, question: "Preferred problem type?", options: ["System design", "Statistical modeling", "User experience", "Market strategy"] },
  { id: 3, question: "Favorite tool?", options: ["Postman/Docker", "Python/Pandas", "Figma/React", "Notion/Jira"] },
  { id: 4, question: "Ideal work style?", options: ["Deep technical focus", "Research & insights", "Creative collaboration", "Cross-functional leadership"] },
  { id: 5, question: "What motivates you?", options: ["Scalable systems", "Data-driven decisions", "Beautiful products", "User impact at scale"] },
];
