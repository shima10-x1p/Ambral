const { CopilotClient, approveAll } = require("@github/copilot-sdk");
(async () => {
  const client = new CopilotClient({ cliPath: "copilot", cwd: process.cwd(), logLevel: "info" });
  try {
    await client.start();
    const session = await client.createSession({ onPermissionRequest: approveAll });
    console.log("SESSION_OK", !!session);
    await session.disconnect();
    const stopResult = await client.stop();
    console.log("STOP_RESULT", JSON.stringify(stopResult));
  } catch (error) {
    console.error("RAW_ERROR_START");
    console.error(error);
    console.error("RAW_ERROR_END");
    try {
      const stopResult = await client.stop();
      console.error("STOP_AFTER_ERROR", JSON.stringify(stopResult));
    } catch (stopError) {
      console.error("STOP_ERROR", stopError);
    }
    process.exitCode = 1;
  }
})();
