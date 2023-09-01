import moment from "moment";

// Get a current timestamp, formatted
function getTimestamp(): string {
  return moment().format("YYYY-MM-DD HH:mm:ss");
}

// Check to see if environment variables have been loaded
function checkEnvConfig(): boolean {
  return process.env.LOADED === "true" ? true : false;
}

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
  console.log(`[${getTimestamp()}] Service is online with no errors...`);
};

export default main;
