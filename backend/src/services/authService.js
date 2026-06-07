import { User, Student, Recruiter } from "../models/index.js";
import { AppError } from "../utils/helpers.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { USER_ROLES } from "../constants/index.js";

export async function register({ name, email, password, role }) {
  const normalizedRole = (role || "student").toLowerCase();
  if (!USER_ROLES.includes(normalizedRole)) {
    throw new AppError("Role must be student or recruiter", 400);
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new AppError("Email already registered", 400);

  const user = await User.create({
    name: (name || email.split("@")[0]).trim(),
    email: email.toLowerCase(),
    password_hash: await hashPassword(password),
    role: normalizedRole,
  });

  if (normalizedRole === "student") {
    await Student.create({ user_id: user.id });
  } else {
    await Recruiter.create({ user_id: user.id });
  }

  const token = signToken({ email: user.email, role: user.role });
  return { token, email: user.email, role: user.role, name: user.name };
}

export async function login({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw new AppError("Invalid credentials", 401);
  }
  const token = signToken({ email: user.email, role: user.role });
  return { token, email: user.email, role: user.role, name: user.name };
}

export async function getProfile(userId) {
  const user = await User.findOne({ id: userId }).lean();
  if (!user) throw new AppError("User not found", 404);
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}
