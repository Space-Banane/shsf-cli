import chalk from "chalk";

export const helloworldDefinition = {
  name: "helloworld",
  description: "Prints Hello, World! to the terminal.",
  action: async () => {
    console.log(`${chalk.green("✓")} ${chalk.bgGreen.black(" Hello, World! ")}`);
  },
};
