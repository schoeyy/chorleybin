import * as os from "os";
import moment from "moment";

export function consoleOutputMessage(name: string, topic_id: string): void {
  const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
  const server = os.type();

  let serverName = "";
  switch (server) {
    case "Darwin":
      serverName = "macOS";
      break;
    case "Linux":
      serverName = "Linux";
      break;
    case "Windows_NT":
      serverName = "Windows";
      break;
    default:
      serverName = server;
  }

  console.log(
    `[${timestamp}] sent notification to ${name} at ${process.env.SERVER_ADDRESS}/${topic_id} from ${serverName}.`
  );
}
export function consoleErrorMessage(name: string, error: any): void {
  const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
  const server = os.type();

  let serverName = "";
  switch (server) {
    case "Darwin":
      serverName = "macOS";
      break;
    case "Linux":
      serverName = "Linux";
      break;
    case "Windows_NT":
      serverName = "Windows";
      break;
    default:
      serverName = server;
  }

  console.log(
    `[${timestamp}] error notifying ${name} from ${serverName}.
    ${error};
    }`
  );
}
