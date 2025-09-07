// modules/common/mysql.js
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const { logger } = require("../../logger/winstonLogger");

const {
  CONNECTION_LIMIT = "10",
  MYSQL_HOST,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
  MYSQL_PORT = "3306",
  MYSQL_TIMEZONE = "Z",
  MYSQL_SSL_CA_PATH,          // e.g. "./aiven-ca.pem" or an absolute path (Secret File)
  MYSQL_SSL_CA,               // optional: CA content via env (PEM or base64)
} = process.env;

// --- Resolve CA (supports PEM text or base64 in env, or a file path) ---
let caBuf = null;
try {
  if (MYSQL_SSL_CA && MYSQL_SSL_CA.trim()) {
    const raw = MYSQL_SSL_CA.includes("-----BEGIN CERTIFICATE-----")
      ? MYSQL_SSL_CA.replace(/\\n/g, "\n") // handle "\n" in env vars
      : Buffer.from(MYSQL_SSL_CA, "base64").toString("utf8");
    caBuf = Buffer.from(raw);
  } else if (MYSQL_SSL_CA_PATH && MYSQL_SSL_CA_PATH.trim()) {
    const resolved = path.isAbsolute(MYSQL_SSL_CA_PATH)
      ? MYSQL_SSL_CA_PATH
      : path.resolve(process.cwd(), MYSQL_SSL_CA_PATH);
    caBuf = fs.readFileSync(resolved);
  }
} catch (e) {
  logger.error("Failed to load MySQL CA", { message: e.message });
}

const pool = mysql.createPool({
  host: MYSQL_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  port: Number(MYSQL_PORT),
  timezone: MYSQL_TIMEZONE,          // keep server-side TZ consistent
  waitForConnections: true,
  connectionLimit: Number(CONNECTION_LIMIT),
  queueLimit: 0,
  // Important timeouts so connections don’t hang forever
  connectTimeout: 10_000,            // 10s to establish TCP/TLS
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // TLS (if CA present)
  ssl: caBuf
    ? { ca: caBuf, minVersion: "TLSv1.2", rejectUnauthorized: true }
    : undefined,
});

// Self-check on boot
(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    logger.info(`✅ MySQL connected (TLS ${!!caBuf}) at ${MYSQL_HOST}:${MYSQL_PORT}`);
  } catch (err) {
    logger.error("❌ MySQL connection failed", {
      code: err.code,
      errno: err.errno,
      fatal: err.fatal,
      message: err.message,
    });
  }
})();

module.exports = pool;
