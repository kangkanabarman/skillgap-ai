import mongoose from "mongoose";
import { env } from "./env.js";
import {
  User,
  Student,
  Recruiter,
  Job,
  Application,
  Resume,
} from "../models/index.js";

export async function connectDatabase() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected");
  await ensureIndexes();
}

async function ensureIndexes() {
  await Promise.all([
    User.collection.createIndex({ email: 1 }, { unique: true }),
    User.collection.createIndex({ role: 1 }),
    Student.collection.createIndex({ user_id: 1 }, { unique: true }),
    Student.collection.createIndex({ skills: 1 }),
    Recruiter.collection.createIndex({ user_id: 1 }, { unique: true }),
    Job.collection.createIndex({ title: 1 }),
    Job.collection.createIndex({ required_skills: 1 }),
    Job.collection.createIndex({ status: 1, application_deadline: 1 }),
    Job.collection.createIndex({ recruiter_id: 1, created_at: -1 }),
    Application.collection.createIndex({ student_id: 1, job_id: 1 }, { unique: true }),
    Application.collection.createIndex({ job_id: 1, final_match_score: -1 }),
    Application.collection.createIndex({ recruiter_id: 1, application_status: 1 }),
    Application.collection.createIndex({ application_status: 1, created_at: -1 }),
    Resume.collection.createIndex({ user_id: 1, created_at: -1 }),
  ]);
  console.log("MongoDB indexes ensured");
}

export default mongoose;
