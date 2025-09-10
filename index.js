// index.js
require("dotenv").config(); // keep simple; Render injects envs

const http = require("http");
const path = require("path");
const express = require("express");
const compression = require("compression");
const cors = require("cors");
const { logger } = require("./logger/winstonLogger");
const v1 = require("./apis/versions/v1");

// IMPORTANT: initialize DB pool at startup (adjust path if needed)
require("./services/connections/mysql"); // ensures pool is created and pinged

const app = express();
app.set("trust proxy", 1); // Render proxy

// ---------- CORS (allow your frontends) ----------
const allowedOrigins = [
  "https://fit-journey-ten.vercel.app",
  "https://fit-journey-8o30.onrender.com",
  "http://localhost:5173",
];

// app.use(
//   cors({
//     origin(origin, cb) {
//       if (!origin) return cb(null, true); // server-to-server or curl
//       if (allowedOrigins.includes(origin)) return cb(null, true);
//       return cb(new Error("Not allowed by CORS"));
//     },
//     credentials: true,
//     methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     maxAge: 600,
//   })
// );
app.use(cors({
  origin: "*"
})); // handle preflights quickly

// ---------- Request body & compression ----------
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// ---------- Fast health check (for Render) ----------
app.get("/healthz", (_req, res) => res.status(200).send("ok"));

// ---------- Optional: per-request timeout guard ----------
// app.use((req, res, next) => {
//   // If something upstream hangs (DB/external), fail fast instead of proxy 502
//   res.setTimeout(25_000, () => {
//     if (!res.headersSent) {
//       res.status(504).json({ error: "Upstream timeout" });
//     }
//   });
//   next();
// });

// ---------- API routes (PUT THEM BEFORE SPA STATIC) ----------
app.use("/v1", v1);

// ---------- Static assets & SPA fallback ----------
// If you’re building React inside this repo, the build usually ends up in ./client/build
const clientRoot = process.env.CLIENT || "./client"; // e.g. "./client/"
const clientBuildPath = path.resolve(process.cwd(), clientRoot);

// Serve static assets if build exists
app.use(
  express.static(clientBuildPath, {
    setHeaders: (res, filePath) => {
      // cache static assets (except HTML)
      if (/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|pdf)$/.test(filePath)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  })
);

// For static folders you had (documents, grns)
const allowedExt = [
  ".js",
  ".ico",
  ".css",
  ".png",
  ".jpg",
  ".gif",
  ".jpeg",
  ".woff2",
  ".woff",
  ".ttf",
  ".svg",
  ".pdf",
];

app.get("/documents/*", (req, res) => {
  if (allowedExt.some((ext) => req.url.includes(ext))) {
    res.sendFile(path.resolve(`.${req.url}`));
  } else {
    res.sendFile(path.resolve("./documents/images/default.jpg"));
  }
});

app.get("/grns/*", (req, res) => {
  if (allowedExt.some((ext) => req.url.includes(ext))) {
    res.sendFile(path.resolve(`.${req.url}`));
  } else {
    res.sendFile(path.resolve("./grns/default.png"));
  }
});

// Avoid favicon noise
app.get("/favicon.ico", (_req, res) => res.status(204).end());

// SPA fallback AFTER API routes & static
app.get("*", (req, res, next) => {
  // If there is no built frontend, skip to 404/next
  if (!clientBuildPath) return next();
  res.sendFile(path.join(clientBuildPath, "index.html"), (err) => {
    if (err) next(err);
  });
});

// ---------- Global error handler (prevents open sockets) ----------
app.use((err, _req, res, _next) => {
  logger.error("Unhandled error", { message: err.message, stack: err.stack });
  if (res.headersSent) return;
  res.status(500).json({ error: "Internal Server Error" });
});

// ---------- Bootstrap HTTP server ----------
const server = http.createServer(app);

// Reasonable server timeouts so Node doesn’t keep sockets forever
server.headersTimeout = 65_000; // default 60s + a bit
server.requestTimeout = 60_000; // hard timeout for requests
server.timeout = 0;             // keep-alive timeout; 0 = use Node default

const PORT = process.env.PORT || 5000; // Render injects PORT, don’t override in prod
server.listen(PORT, "0.0.0.0", () => {
  logger.info(`🚀 Server listening on ${PORT}`);
});

module.exports = app;
