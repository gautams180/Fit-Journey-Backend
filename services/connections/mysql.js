// mysql.js
const fs = require("fs");
const mysql = require("mysql2/promise");
const { logger } = require("../../logger/winstonLogger");

const {
  CONNECTION_LIMIT = "10",
  MYSQL_HOST,
  MYSQL_USER,
  MYSQL_PASSWORD,         // make sure this is set in Render
  MYSQL_DATABASE,
  MYSQL_PORT = "3306",
  MYSQL_TIMEZONE = "Z",
  MYSQL_SSL_CA_PATH,      // e.g. ./aiven-ca.pem (optional if you inline CA)
  MYSQL_SSL_REJECT_UNAUTH = "true", // set to "false" only for emergency tests
} = process.env;

const ssl =
  MYSQL_SSL_CA_PATH
    ? { ca: fs.readFileSync(MYSQL_SSL_CA_PATH) }
    : { minVersion: "TLSv1.2" }; // works with Aiven if CA validation not enforced

// If you must connect without validating the CA (not recommended), do:
// const ssl = { rejectUnauthorized: false };

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
  ssl,
});

(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    logger.info(`☘️  MySQL connected at ${MYSQL_HOST}:${MYSQL_PORT}`);
  } catch (err) {
    logger.error("MySQL connection failed", { code: err.code, errno: err.errno, fatal: err.fatal, message: err.message });
  }
})();

module.exports = pool;
