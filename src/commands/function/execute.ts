import chalk from "chalk";
import { getApiClient } from "../../api.js";
import { AxiosResponse } from "axios";

export const functionExecuteDefinition = {
  name: "execute",
  description: "Execute a function and stream the output (debug/internal).",
  options: [
    { name: "--id <id>", description: "Function ID", required: true },
    { name: "--payload <json>", description: "JSON payload for execution", required: false },
    { name: "--no-stream", description: "Disable streaming and get final result only", required: false, default: false },
  ],
  action: async (options: any) => {
    const client = await getApiClient();
    
    // Explicitly check for noStream from commander
    // Commander uses camelsCase for options, so --no-stream becomes stream: false
    // but we use --no-stream which commander natively handles as a boolean toggle
    const useStream = options.stream !== false;

    let payload = {};
    if (options.payload) {
      try {
        payload = JSON.parse(options.payload);
      } catch (error: any) {
        console.error(`${chalk.red("✗")} Invalid JSON payload: ${chalk.yellow(error.message)}`);
        return;
      }
    }

    const handleJsonChunk = (chunk: string) => {
      const trimmed = chunk.trim();
      if (!trimmed) return;

      try {
        const obj = JSON.parse(trimmed);
        if (obj.type === "output" && obj.content) {
          process.stdout.write(obj.content);
        } else if (obj.type === "end") {
          if (obj.exitCode !== 0 && obj.exitCode !== undefined) {
            console.error(`\n${chalk.red("✗")} Execution failed with exit code ${obj.exitCode}`);
          } else {
            console.log(`\n${chalk.green("✓")} Execution completed.`);
          }
          if (obj.result !== undefined) {
            console.log(chalk.blue("Result:"), typeof obj.result === 'object' ? JSON.stringify(obj.result, null, 2) : obj.result);
          }
          if (obj.took) {
            const total = obj.took.find((t: any) => t.description === "Total");
            if (total) {
              console.log(chalk.gray(`Total time: ${total.value}s`));
            }
          }
        }
      } catch (e) {
        // If it's not JSON, it might be raw output from a non-stream response 
        // that got into the stream handler mistakenly or just raw noise
        if (trimmed.length > 0) {
          process.stdout.write(chunk);
        }
      // Not a full JSON object yet or invalid JSON
      }
    };

    console.log(`${chalk.blue("ℹ")} Executing function ${chalk.cyan(options.id)} (stream: ${useStream})...`);

    try {
      const response = await client.post(`/api/function/${options.id}/execute`, 
        { run: payload },
        { 
          params: { stream: useStream ? "true" : "false" },
          responseType: useStream ? "stream" : "json"
        }
      );

      if (useStream) {
        const stream = (response as AxiosResponse).data;
        let buffer = "";
        
        return new Promise<void>((resolve, reject) => {
          stream.on("data", (chunk: any) => {
            const str = chunk.toString();
            buffer += str;
            
            // Try to split by potential JSON boundaries
            // Matches cases like ...}{...
            const pattern = /\}\s*\{/g;
            let lastIndex = 0;
            let match;

            while ((match = pattern.exec(buffer)) !== null) {
              const part = buffer.slice(lastIndex, match.index + 1);
              handleJsonChunk(part);
              lastIndex = match.index + match[0].indexOf('{');
            }

            buffer = buffer.slice(lastIndex);

            // Attempt to parse the remaining buffer if it looks like a complete object
            try {
              if (buffer.trim().startsWith('{') && buffer.trim().endsWith('}')) {
                handleJsonChunk(buffer);
                buffer = "";
              }
            } catch (e) {
              // Wait for more data
            }
          });

          stream.on("end", () => {
            if (buffer.trim()) {
              handleJsonChunk(buffer);
            }
            resolve();
          });

          stream.on("error", (err: Error) => {
            console.error(`\n${chalk.red("✗")} Stream error: ${err.message}`);
            reject(err);
          });
        });
      } else {
        // Non-stream returns just the output content or the body
        const result = response.data;
        if (typeof result === 'string') {
          process.stdout.write(result);
        } else if (result && result.data && typeof result.data === 'string') {
          process.stdout.write(result.data);
        } else if (result && typeof result.output === 'string') {
          process.stdout.write(result.output);
        } else if (result && typeof result.result === 'string') {
          process.stdout.write(result.result);
        } else if (result && result.data && result.data.output) {
          process.stdout.write(result.data.output);
        } else {
          process.stdout.write(JSON.stringify(result, null, 2));
        }
        console.log(`\n${chalk.green("✓")} Execution completed.`);
      }
    } catch (error: any) {
      if (error.response) {
        console.error(
          `${chalk.red("✗")} Execution failed: ${chalk.yellow(error.response.data?.message || error.response.statusText || "Unknown error")}`,
        );
      } else if (error.request) {
        console.error(`${chalk.red("✗")} No response received from server.`);
      } else {
        console.error(`${chalk.red("✗")} Error: ${error.message}`);
      }
    }
  },
};
