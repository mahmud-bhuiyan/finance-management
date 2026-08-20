import "./config/loadEnv.js";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { ensureSuperAdmin } from "./services/bootstrapService.js";

const app = createApp();

const start = async () => {
  await ensureSuperAdmin();
  app.listen(env.PORT, () => {
    console.log(`FMS API listening on http://localhost:${env.PORT}`);
  });
};

void start();
