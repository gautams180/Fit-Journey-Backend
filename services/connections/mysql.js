// mysql.js
const fs = require("fs");
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
  MYSQL_SSL_CA_PATH,           // e.g. "./aiven-ca.pem"
  MYSQL_SSL_CA,                // optional: CA content via env (PEM or base64)
} = process.env;

// If the CA is in an env var, normalize it (supports raw PEM or base64)
let caBuf = null;
if (MYSQL_SSL_CA) {
  const val = MYSQL_SSL_CA.includes("-----BEGIN CERTIFICATE-----")
    ? MYSQL_SSL_CA.replace(/\\n/g, "\n")           // handle \n in env
    : Buffer.from(MYSQL_SSL_CA, "base64").toString("utf8");
  caBuf = Buffer.from(val);
} else if (MYSQL_SSL_CA_PATH) {
  caBuf = fs.readFileSync(MYSQL_SSL_CA_PATH);
}

const pool = mysql.createPool({
  host: MYSQL_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  port: Number(MYSQL_PORT),
  timezone: MYSQL_TIMEZONE,
  waitForConnections: true,
  connectionLimit: Number(CONNECTION_LIMIT),
  queueLimit: 0,
  ssl: caBuf ? { ca: caBuf, minVersion: "TLSv1.2", rejectUnauthorized: true } : undefined,
});

(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    logger.info(`✅ MySQL connected (TLS) at ${MYSQL_HOST}:${MYSQL_PORT}`);
  } catch (err) {
    logger.error("MySQL connection failed", {
      code: err.code, errno: err.errno, fatal: err.fatal, message: err.message
    });
  }
})();

module.exports = pool;
