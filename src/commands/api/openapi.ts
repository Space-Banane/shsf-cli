import chalk from "chalk";
import { getApiClient } from "../../api.js";
import { printJson } from "../../utils/json.js";

export const apiOpenApiDefinition = {
  name: "openapi",
  description: "Print the live SHSF OpenAPI document.",
  action: async () => {
    const client = await getApiClient();

    try {
      const response = await client.get("/api/openapi.json");
      printJson(response.data);
    } catch (error: any) {
      if (error.response) {
        console.error(`${chalk.red("✗")} Failed to fetch OpenAPI: ${error.response.status}`);
        printJson(error.response.data);
      } else {
        console.error(`${chalk.red("✗")} ${error.message}`);
      }
    }
  },
};
