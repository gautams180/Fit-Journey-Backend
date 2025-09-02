var mysql = require("mysql2/promise");
var util = require("util");
const { logger } = require("../../logger/winstonLogger");
const ENV = process.env;

var pool = mysql.createPool({
  connectionLimit: ENV.CONNECTION_LIMIT,
  host: ENV.MYSQL_HOST,
  user: ENV.MYSQL_USER,
  password: ENV.MYSQL_PASSWORD,
  database: ENV.MYSQL_DATABASE,
  port: ENV.MYSQL_PORT,
  timezone: ENV.MYSQL_TIMEZONE,
});

pool.getConnection(function (err, connection) {
  if (err) {
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("Database connection was closed.");
    }
    if (err.code === "ER_CON_COUNT_ERROR") {
      console.error("Database has too many connections.");
    }
    if (err.code === "ECONNREFUSED") {
      console.error("Database connection was refused.");
    }
  } else {
    logger.info(`☘️  Databases connected successfully at ${ENV.MYSQL_HOST}:${ENV.MYSQL_PORT}`);
    pool.beginTransaction = connection.beginTransaction;
    pool.rollback = connection.rollback;
    pool.commit = connection.commit;
  }
  if (connection) connection.release();
  return;
});

pool.query = util.promisify(pool.query).bind(pool);

module.exports = pool;
