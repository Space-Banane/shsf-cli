import chalk from "chalk";
import { getApiClient } from "../api.js";

export const uiUrlDefinition = {
    name: "uiurl",
    description: "Get the URL for the SHSF UI.",
    action: async () => {
        await getUiURL();
    },
};

async function getUiURL(): Promise<void> {
    const client = await getApiClient();

    try {
        const response = await client.get<{ status: string; uiUrl: string }>("/api/global/uiUrl");

        if (response.status === 200 && response.data.status === "OK") {
            console.log(
                `${chalk.green("✓")} SHSF UI URL: ${chalk.bgGreen.black(` ${response.data.uiUrl} `)}`
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
                `${chalk.red("✗")} SHSF Status: ${chalk.bgRed.black(" UNHEALTHY ")}`,
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
