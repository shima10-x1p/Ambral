const { spawn } = require("node:child_process");

const candidates = [
  "C:/Users/motoki/repos/Ambral/node_modules/.bin/copilot.cmd",
  "C:/Users/motoki/AppData/Local/Microsoft/WinGet/Links/copilot.exe",
  "copilot"
];

function runCandidate(candidate) {
  return new Promise((resolve) => {
    console.log("TRY", candidate);
    const child = spawn(candidate, ["--version"], { stdio: "pipe" });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      console.log("ERROR", candidate, error.message);
      resolve();
    });

    child.on("close", (code) => {
      console.log("CLOSE", candidate, code, stdout.trim(), stderr.trim());
      resolve();
    });
  });
}

(async () => {
  for (const candidate of candidates) {
    await runCandidate(candidate);
  }
})();
