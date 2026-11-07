const express = require("express");
const cors = require("cors");
const config = require("./config/env");
const gamesRouter = require("./routes/games");

const app = express();

const isPrivateLanAddress = (hostname) => {
  const octets = hostname.split(".").map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return false;
  }
  return octets[0] === 10 ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168);
};

app.disable("x-powered-by");
app.use(cors({
  origin(origin, callback) {
    let isLocalDevelopmentOrigin = false;
    if (process.env.NODE_ENV !== "production" && origin) {
      try {
        const { protocol, hostname } = new URL(origin);
        isLocalDevelopmentOrigin =
          protocol === "http:" && ["localhost", "127.0.0.1", "::1"].includes(hostname);
        isLocalDevelopmentOrigin =
          isLocalDevelopmentOrigin || (protocol === "http:" && isPrivateLanAddress(hostname));
      } catch {
        isLocalDevelopmentOrigin = false;
      }
    }
    if (!origin || config.frontendOrigins.includes(origin) || isLocalDevelopmentOrigin) {
      return callback(null, true);
    }
    const error = new Error("Origin is not allowed by CORS.");
    error.status = 403;
    return callback(error);
  },
  methods: ["GET", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  maxAge: 86400,
}));
app.use(express.json({ limit: "16kb" }));
app.use("/api", gamesRouter);

app.use((req, res) => res.status(404).json({ error: "Endpoint not found." }));

app.use((error, _req, res, _next) => {
  const status = Number.isInteger(error.status) && error.status >= 400 && error.status <= 599
    ? error.status
    : 502;
  if (status >= 500) {
    const providerErrors = error.providers
      ? Object.entries(error.providers)
        .map(([provider, providerError]) => `${provider}: ${providerError?.message || "unknown error"}`)
        .join("; ")
      : error.message;
    console.error(`[api] ${providerErrors}`);
  } else {
    console.warn(`[api] ${error.message}`);
  }
  res.status(status).json({
    error: status >= 500 ? "Game data providers are temporarily unavailable." : error.message,
  });
});

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`DreadVault API listening on port ${config.port}`);
  });
}

module.exports = app;
