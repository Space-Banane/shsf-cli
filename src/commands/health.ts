import chalk from "chalk";
import { getApiClient } from "../api.js";

export const healthDefinition = {
  name: "health",
  description: "Perform a health check on the current SHSF instance.",
  action: async () => {
    await healthCheck();
  },
};

async function healthCheck() {
  const client = await getApiClient();

  try {
    const response = await client.get("/health");

    if (response.status === 200 && response.data.status === "OK") {
      console.log(
        `${chalk.green("✓")} SHSF Status: ${chalk.bgGreen.black(" HEALTHY ")}`,
      );
    } else {
      console.log(
        `${chalk.yellow("!")} SHSF Status: ${chalk.bgYellow.black(" UNEXPECTED RESPONSE ")}`,
      );
      console.log(`Status Code: ${chalk.blue(response.status)}`);
      console.log(`Response Data: ${JSON.stringify(response.data)}`);
    }
  } catch (error: any) {
    if (error.response) {
      console.error(
        `${chalk.red("✗")} System Status: ${chalk.bgRed.black(" UNHEALTHY ")}`,
      );
      console.error(`Status Code: ${chalk.red(error.response.status)}`);
      console.error(
        `Message: ${chalk.yellow(error.response.data.message || "Unknown error from server")}`,
      );
    } else if (error.request) {
      console.error(
        `${chalk.red("✗")} SHSF Status: ${chalk.bgRed.black(" DISCONNECTED ")}`,
      );
      console.error(
        `Error: ${chalk.yellow("Could not connect to the SHSF instance. Check your connection or SHSF_INSTANCE URL.")}`,
      );
    } else {
      console.error(
        `${chalk.red("✗")} SHSF Status: ${chalk.bgRed.black(" LOCAL ERROR ")}`,
      );
      console.error(`Error: ${chalk.yellow(error.message)}`);
    }
  }
}
