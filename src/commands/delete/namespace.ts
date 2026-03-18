import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const deleteNamespaceDefinition = {
  name: "namespace <id>",
  description: "Deletes a namespace and all its functions by ID.",
  action: async (id: string) => {
    await deleteNamespace(id);
  },
};

async function deleteNamespace(id: string) {
  const client = await getApiClient();

  try {
    const response = await client.delete(`/api/namespace/${id}`);

    if (response.status === 200) {
      console.log(
        `${chalk.green("✓")} Namespace with ID ${chalk.cyan(id)} has been deleted.`,
      );
    } else {
      console.log(
        `${chalk.yellow("!")} Unexpected response from server.`,
      );
      console.log(`Status Code: ${chalk.blue(response.status)}`);
    }
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 404) {
        console.error(`${chalk.red("✗")} Namespace with ID ${chalk.yellow(id)} not found.`);
      } else {
        console.error(
          `${chalk.red("✗")} Failed to delete namespace.`,
        );
        console.error(`Status Code: ${chalk.red(error.response.status)}`);
        console.error(
          `Message: ${chalk.yellow(error.response.data.message || "Unknown error from server")}`,
        );
      }
    } else if (error.request) {
      console.error(`${chalk.red("✗")} No response received from server.`);
    } else {
      console.error(`${chalk.red("✗")} Error:`, error.message);
    }
  }
}
