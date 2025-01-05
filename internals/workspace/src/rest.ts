import { Rest } from "@nyxjs/rest";
import { REST_OPTIONS } from "./config.js";

const rest = new Rest(REST_OPTIONS);

rest.on("request", console.log);
rest.on("response", console.log);
rest.on("rateLimit", console.log);
rest.on("globalRateLimit", console.log);

setInterval(async () => {
  try {
    await rest.users.getCurrentUserGuilds();
  } catch (err) {
    console.log(err);
  }
}, 2000);
