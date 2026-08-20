import app from "./app.js";
import { env } from "./config/env.js";

// Vercel invokes the exported Express app. Do not listen in that environment.
if (!process.env.VERCEL) {
  app.listen(env.PORT, () => {
    console.log(`FMS API listening on http://localhost:${env.PORT}`);
  });
}

export default app;
