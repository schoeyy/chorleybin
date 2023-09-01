import dotenv from "dotenv";
dotenv.config();
import schedule from "node-schedule";
import fs from "fs";

interface CollectionEntry {
  collectionDate: string;
  greenBin: boolean;
  blueBin: boolean;
  brownBin: boolean;
}

console.log("Notify listener is running.")

// Schedule for every Wednesday, 18:00
const send = schedule.scheduleJob("0 18 * * 5", function () {
  fs.readFile("./src/areas/pr67ad.json", "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading the file: ${err}`);
      return;
    }

    const jsonData: CollectionEntry[] = JSON.parse(data);

    // Creates a date equal to current date + 1 day
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedTomorrow = `${tomorrow.getFullYear()}-${(
      tomorrow.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${tomorrow.getDate().toString().padStart(2, "0")}`;

    jsonData.forEach((entry: CollectionEntry) => {
      if (entry.collectionDate === formattedTomorrow) {
        let binColour: string[] = [];

        if (entry.greenBin) {
          binColour.push("green");
        }
        if (entry.blueBin) {
          binColour.push("blue");
        }
        if (entry.brownBin) {
          binColour.push("brown");
        }

        // Uppercase first letter of each bin colour 
        binColour = binColour.map(
          (color) => color.charAt(0).toUpperCase() + color.slice(1)
        );

        // Formatting the array into two words with spacing
        let binColourStr: string =
          binColour.length > 1
            ? `${binColour.slice(0, -1).join(", ")} & ${binColour.slice(-1)}`
            : binColour[0];

        // Different output words, depending on how many bin entries are in the array
        const binPlural: string = binColour.length > 1 ? "bins are" : "bin is";

        // Send the 'take' notification message to the push server
        try {
          fetch(`${process.env.SERVER_ADDRESS}/${process.env.TOPIC}`, {
            method: "POST",
            body: `Reminder: ${binColourStr} ${binPlural} being collected tomorrow!`,
          });
        } catch (error) {
          console.log(`Error pushing notification to channel!`);
          return;
        }

        // Timeout for 15 hours, or 9am the following day
        setTimeout(() => {
          // Different output depending on how many bin entries are in the array
          const binPlural2: string = binColour.length > 1 ? "bins" : "bin";

          // Send the 'retrieve' notification message to the push server
          try {
            fetch(`${process.env.SERVER_ADDRESS}/${process.env.TOPIC}`, {
              method: "POST",
              body: `Reminder: Bring back the ${binColourStr} ${binPlural2} you put out, yesterday!`,
            });
          } catch (error) {
            console.log(`Error pushing notification to channel!`);
            return;
          }
        }, 54000000); // 1hr = 3,600,000ms, 15hr = 54,000,000
      }
    });
  });
});
