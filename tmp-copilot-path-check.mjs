import { CopilotClient, approveAll } from "@github/copilot-sdk";
import path from "node:path";
import { access } from "node:fs/promises";

const candidates = [
  path.resolve(process.cwd(), "node_modules/.bin/copilot.cmd"),
  path.resolve(process.cwd(), "node_modules/.bin/copilot.exe"),
  path.resolve(process.cwd(), "node_modules/.bin/copilot"),
  "copilot"
];

for (const candidate of candidates) {
  try {
    if (candidate.includes("node_modules")) {
      await access(candidate);
    }
    const client = new CopilotClient({ cliPath: candidate, cwd: process.cwd(), logLevel: "info" });
    await client.start();
    const session = await client.createSession({ onPermissionRequest: approveAll });
    console.log("CANDIDATE_OK", candidate);
    await session.disconnect();
    await client.stop();
    process.exit(0);
  } catch (error) {
    console.error("CANDIDATE_FAIL", candidate);
    console.error(error);
  }
}
process.exit(1);
