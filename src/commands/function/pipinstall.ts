import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const pipInstallDefinition = {
  name: "pipinstall",
  description: "Install Python dependencies for a function using requirements.txt",
  options: [
    {
      name: "--id <id>",
      description: "The ID of the function.",
      required: true,
    },
  ],
  action: async (options: { id: string }) => {
    await pipInstallFunction(options.id);
  },
};

async function pipInstallFunction(id: string) {
  const client = await getApiClient();

  try {
    const response = await client.post(`/api/function/${id}/pip-install`);

    if (response.status === 200) {
      console.log(`${chalk.green("✓")} Dependencies installed successfully for function ${chalk.yellow(id)}.`);
      if (response.data && response.data.status) {
        console.log(`${chalk.gray("Status:")} ${response.data.status}`);
      }
    } else {
      console.log(
        `${chalk.yellow("!")} Unexpected response from server.`,
      );
      console.log(`Status Code: ${chalk.blue(response.status)}`);
    }
  } catch (error: any) {
    if (error.response) {
      console.error(
        `${chalk.red("✗")} Failed to install dependencies.`,
      );
      console.error(`Status Code: ${chalk.red(error.response.status)}`);
      console.error(
        `Message: ${chalk.yellow(error.response.data?.message || "Unknown error from server")}`,
      );
    } else if (error.request) {
      console.error(
        `${chalk.red("✗")} Failed to install dependencies.`,
      );
      console.error(
        `${chalk.yellow("Could not connect to the SHSF instance. Check your connection.")}`,
      );
    } else {
      console.error(`${chalk.red("✗")} Error:`, error.message);
    }
  }
}
