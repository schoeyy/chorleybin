import moment from "moment";
import fs from "fs";
import path from "path";

const directoryPath = "./dist/data";

// Get a current timestamp, formatted
function getTimestamp(): string {
  return moment().format("YYYY-MM-DD HH:mm:ss");
}

// Check to see if environment variables have been loaded
function checkEnvConfig(): boolean {
  return process.env.LOADED === "true" ? true : false;
}

// Check to see if all the files in data can be read
const checkFileSystem = (directoryPath: string): boolean => {
  try {
    const files = fs.readdirSync(directoryPath);

    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      fs.readFileSync(filePath);
    }

    return true;
  } catch (error) {
    return false;
  }
};

// Main function
const main = () => {
  console.log(`[${getTimestamp()}] Starting service...`);

  if (checkEnvConfig()) {
    console.log(
      `[${getTimestamp()}] Environment configuration successfully loaded.`
    );
  } else {
    console.error(
      `[${getTimestamp()}] Failed to load environment configuration.`
    );
    process.exit(1);
  }

  if (checkFileSystem(directoryPath)) {
    console.log(`[${getTimestamp()}] All dependencies are available.`);
  } else {
    console.error(
      `[${getTimestamp()}] One or more dependencies are unavailable.`
    );
    process.exit(1);
  }

  console.log(`[${getTimestamp()}] Service is online with no errors...`);
};

export default main;
