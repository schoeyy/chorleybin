import dotenv from "dotenv";
dotenv.config();
import * as Discord from "discord.js";
import schedule from "node-schedule";
import fs from "fs";

const client = new Discord.Client({
  intents: [Discord.GatewayIntentBits.Guilds],
});

interface CollectionEntry {
  collectionDate: string;
  greenBin: boolean;
  blueBin: boolean;
  brownBin: boolean;
}

client.once("ready", () => {
  console.log("Bin collection is running!");

  const job = schedule.scheduleJob("0 18 * * 3", function () {
    fs.readFile("./src/areas/pr67ad.json", "utf8", (err, data) => {
      if (err) {
        console.error(`Error reading the file: ${err}`);
        return;
      }

      const jsonData: CollectionEntry[] = JSON.parse(data);

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

          let binColourStr =
            binColour.length > 1
              ? `${binColour.slice(0, -1).join(", ")} & ${binColour.slice(-1)}`
              : binColour[0];

          const channel = client.channels.cache.get(
            "1145683285557661727"
          ) as Discord.TextChannel;

          if (channel && binColourStr) {
            channel.send({
              content: `**Tomorrow's bin collection is ${binColourStr}**\n\n<@213081486583136256>`,
            });
          } else {
            console.log(`Error locating channel to post message!`);
            return;
          }
        }
      });
    });
  });
});

client.login(process.env.TOKEN);
