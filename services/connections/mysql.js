const mysql = require('mysql2/promise');

const ENV = {
  CONNECTION_LIMIT: parseInt(process.env.CONNECTION_LIMIT ?? '10', 10),
  MYSQL_HOST: process.env.MYSQL_HOST,
  MYSQL_USER: process.env.MYSQL_USER,
  MYSQL_PASSWORD: process.env.MYSQL_PASSWORD,
  MYSQL_DATABASE: process.env.MYSQL_DATABASE,
  MYSQL_PORT: parseInt(process.env.MYSQL_PORT ?? '3306', 10),
  MYSQL_TIMEZONE: process.env.MYSQL_TIMEZONE ?? 'Z',
};

const pool = mysql.createPool({
  connectionLimit: ENV.CONNECTION_LIMIT,
  host: ENV.MYSQL_HOST,
  user: ENV.MYSQL_USER,
  password: ENV.MYSQL_PASSWORD,
  database: ENV.MYSQL_DATABASE,
  port: ENV.MYSQL_PORT,
  timezone: ENV.MYSQL_TIMEZONE,
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('☘ Database connected successfully.');
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    // Up to you: process.exit(1) here if you want to crash fast
  }
})();

module.exports = pool;
