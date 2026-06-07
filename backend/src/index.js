import { createApp } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { checkAiHealth } from "./services/aiService.js";

async function bootstrap() {
  await connectDatabase();
  const app = await createApp();
  const ai = await checkAiHealth();
  console.log(`AI service: ${ai.status || "unknown"}`);

  app.listen(env.port, () => {
    console.log(`SkillGap API running on http://127.0.0.1:${env.port}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
