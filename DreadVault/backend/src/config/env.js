const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const parseOrigins = (value) =>
  String(value || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

module.exports = {
  port: Number(process.env.PORT) || 8001,
  twitchClientId: process.env.TWITCH_CLIENT_ID || "",
  twitchClientSecret: process.env.TWITCH_CLIENT_SECRET || "",
  rawgApiKey: process.env.RAWG_API_KEY || "",
  frontendOrigins: parseOrigins(
    process.env.FRONTEND_ORIGINS ||
      "http://localhost:3000,http://127.0.0.1:3000,https://dreadvault.vercel.app"
  ),
};
