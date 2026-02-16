/**
 * Trigger a production deployment on Vercel (main branch) via Deploy Hook.
 *
 * Setup: In .env.local add:
 *   VERCEL_DEPLOY_HOOK_MAIN=https://api.vercel.com/v1/integrations/deploy/...
 *
 * Get the URL from Vercel: Project → Settings → Git → Deploy Hooks → create one for branch "main".
 *
 * Usage:
 *   npm run deploy:prod
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
dotenv.config({ path: join(root, ".env.local") });

const url = process.env.VERCEL_DEPLOY_HOOK_MAIN;
if (!url) {
  console.error(
    "Missing VERCEL_DEPLOY_HOOK_MAIN in .env.local. Add your Deploy Hook URL from Vercel (Settings → Git → Deploy Hooks)."
  );
  process.exit(1);
}

const res = await fetch(url, { method: "POST" });
const data = await res.json();

if (!res.ok) {
  console.error("Deploy hook failed:", data);
  process.exit(1);
}

if (data.job?.state === "PENDING") {
  console.log("Production deploy triggered. Check Vercel → Deployments.");
} else {
  console.log("Response:", data);
}
