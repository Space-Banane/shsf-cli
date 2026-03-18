import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const setItemDefinition = {
  name: "set-item",
  description: "Set a storage item.",
  options: [
    { name: "--name <name>", description: "Storage name", required: true },
    { name: "--key <key>", description: "Item key", required: true },
    { name: "--value <value>", description: "Item value (JSON string)", required: true },
    { name: "--expires <expires>", description: "Expiration (ISO string or hours)" },
  ],
  action: async (options: any) => {
    let value;
    try {
      value = JSON.parse(options.value);
    } catch (e) {
      // If not valid JSON, treat as string
      value = options.value;
    }

    const data: any = {
      key: options.key,
      value: value,
    };

    if (options.expires) {
      if (!isNaN(Number(options.expires))) {
        data.expiresAt = Number(options.expires);
      } else {
        data.expiresAt = options.expires;
      }
    }

    const client = await getApiClient();

    try {
      const response = await client.post(`/api/storage/${options.name}/item`, data);

      if (response.status === 200 || response.status === 201) {
        console.log(
          `${chalk.green("✓")} Item ${chalk.cyan(options.key)} set successfully in ${chalk.cyan(options.name)}!`,
        );
      } else {
        console.log(
          `${chalk.yellow("!")} Unexpected response from server: ${response.status}`,
        );
      }
    } catch (error: any) {
      if (error.response) {
        console.error(
          `${chalk.red("✗")} Failed to set item: ${chalk.yellow(error.response.data.message || "Unknown error")}`,
        );
      } else {
        console.error(`${chalk.red("✗")} Error: ${error.message}`);
      }
    }
  },
};
