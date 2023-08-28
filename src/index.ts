import dotenv from "dotenv";
dotenv.config();
import * as Discord from "discord.js";
import schedule from "node-schedule";
import fs from "fs";

const client = new Discord.Client({
  intents: [],
});

interface CollectionEntry {
  collectionDate: string;
  greenBin: boolean;
  blueBin: boolean;
  brownBin: boolean;
}

client.once("ready", () => {
  console.log("Bot is online!");

  // Schedule job to run every Monday at 1pm
  const job = schedule.scheduleJob("48 12 * * 1", function () {
    console.log("Schedule triggered success!");
    fs.readFile("./bindates.json", "utf8", (err, data) => {
      if (err) {
        console.error(`Error reading the file: ${err}`);
        return;
      }

      const jsonData: CollectionEntry[] = JSON.parse(data);
      console.log('jsonData: ', jsonData);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const formattedTomorrow = `${tomorrow.getFullYear()}-${(
        tomorrow.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}-${tomorrow.getDate().toString().padStart(2, "0")}`;

      console.log("formattedTomorrow: ", formattedTomorrow);

      jsonData.forEach((entry: CollectionEntry) => {
        if (entry.collectionDate === formattedTomorrow) {
          let binColour = "";
          if (entry.greenBin) {
            binColour = "red";
          } else if (entry.blueBin) {
            binColour = "blue";
          } else if (entry.brownBin) {
            binColour = "green";
          }

          const channel = client.channels.cache.get(
            "1145683285557661727"
          ) as Discord.TextChannel;

          if (channel && binColour) {
            channel.send({
              content: `@everyone, tomorrow's bin collection is ${binColour}`,
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
