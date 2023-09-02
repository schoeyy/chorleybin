import dotenv from "dotenv";
dotenv.config();
import schedule from "node-schedule";
import fs from "fs/promises";
import main from "./initialization";

main();

interface User {
  name: string;
  notifyDate: string;
  postcode: string;
  topic_id: string;
}
interface CollectionEntry {
  collectionDate: string;
  greenBin: boolean;
  blueBin: boolean;
  brownBin: boolean;
}

// Reads file for list of all users to notify
async function readUsersJson(filePath: string): Promise<User[]> {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading the file: ${err}`);
    throw err;
  }
}

(async () => {
  try {
    const users = await readUsersJson("./dist/data/users.json");
    // Iterate over each user and schedule a job
    users.forEach((user: User) => {
      // Schedule for every Wednesday, 18:00
      schedule.scheduleJob(user.notifyDate, async function () {
        try {
          const data = await fs.readFile(
            `./dist/data/${user.postcode}.json`,
            "utf8"
          );

          const jsonData: CollectionEntry[] = JSON.parse(data);

          // Creates a date equal to current date + 1 day
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const formattedTomorrow = `${tomorrow.getFullYear()}-${(
            tomorrow.getMonth() + 1
          )
            .toString()
            .padStart(2, "0")}-${tomorrow
            .getDate()
            .toString()
            .padStart(2, "0")}`;

          jsonData.forEach((entry: CollectionEntry) => {
            if (entry.collectionDate === formattedTomorrow) {
              let binColour: string[] = [];

              const colourMapping: any = {
                green: "green_circle",
                blue: "large_blue_circle",
                brown: "brown_circle",
              };

              if (entry.greenBin) {
                binColour.push("green");
              }
              if (entry.blueBin) {
                binColour.push("blue");
              }
              if (entry.brownBin) {
                binColour.push("brown");
              }

              // Create tags for corresponding bins
              let tags: string[] = binColour.map(
                (colour) => colourMapping[colour]
              );
              let tagsStr: string = tags.join(",");

              // Uppercase first letter of each bin colour
              binColour = binColour.map(
                (color) => color.charAt(0).toUpperCase() + color.slice(1)
              );

              // Formatting the array into two words with spacing
              let binColourStr: string =
                binColour.length > 1
                  ? `${binColour.slice(0, -1).join(", ")} & ${binColour.slice(
                      -1
                    )}`
                  : binColour[0];

              // Different output words, depending on how many bin entries are in the array
              const binPlural: string =
                binColour.length > 1 ? "bins are" : "bin is";
              const binPlural2: string = binColour.length > 1 ? "bins" : "bin";

              // Send the 'take' notification message to the push server
              try {
                fetch(`${process.env.SERVER_ADDRESS}/${user.topic_id}`, {
                  method: "POST",
                  body: `Reminder: ${binColourStr} ${binPlural} being collected tomorrow!`,
                  headers: {
                    Title: `${capitalizeFirstLetter(
                      user.name
                    )}, it's ${binColourStr} ${binPlural2} tomorrow!`,
                    Priority: "4",
                    Tags: tagsStr,
                  },
                });
              } catch (error) {
                console.log(`Error pushing notification to channel!`);
                return;
              } finally {
                retrieveBin(user, binColourStr, binPlural2, tagsStr);
              }
            }
          });
        } catch (error) {
          console.log(`Error reading postcode file: ${error}`);
        }
      });
    });
  } catch (error) {
    console.log(`Error at the read user file level: ${error}`);
  }
})();

function capitalizeFirstLetter(input: string): string {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

function retrieveBin(
  user: User,
  binColourStr: string,
  binPlural2: string,
  tagsStr: string
) {
  // Timeout for 15 hours, or 9am the following day
  setTimeout(() => {
    // Send the 'retrieve' notification message to the push server
    try {
      fetch(`${process.env.SERVER_ADDRESS}/${user.topic_id}`, {
        method: "POST",
        body: `Reminder: Bring back the ${binColourStr} ${binPlural2} you put out, yesterday!`,
        headers: {
          Title: `${capitalizeFirstLetter(
            user.name
          )}, grab the ${binColourStr} ${binPlural2}`,
          Priority: "4",
          Tags: tagsStr,
        },
      });
    } catch (error) {
      console.log(`Error pushing notification to channel!`);
      return;
    }
  }, 54000000); // 1hr = 3,600,000ms, 15hr = 54,000,000
}
