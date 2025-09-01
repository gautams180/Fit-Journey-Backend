const winston = require('winston');

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const LOGGER_LEVEL = process.env.LOG_LEVEL || 'info';

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'white',
    http: 'magenta',
    debug: 'green',
};

winston.addColors(colors);

const consoleLogFormat = winston.format.combine(
    winston.format.timestamp({ format: 'DD MMM, YYYY - hh:mm:ss:ms A' }),
    winston.format.colorize({ all: true }),
    winston.format.printf((info) => `[${info.timestamp}] [${info.level}]: ${info.message}`)
);

const fileLogFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf((info) => `[${info.timestamp}] [${info.level.toUpperCase()}]: ${info.message}`)
);

const transports = [
    new winston.transports.Console({ format: consoleLogFormat }),
    new winston.transports.File({
        filename: 'logs/errors.log',
        level: 'error',
        format: fileLogFormat,
    }),
    new winston.transports.File({
        filename: 'logs/warnings.log',
        level: 'warn',
        format: fileLogFormat,
    }),
];

const logger = winston.createLogger({
    level: LOGGER_LEVEL,
    levels,
    transports,
});

const logSyncEvent = (eventType, details) => {
    logger.info(`SYNC EVENT: ${eventType} - ${JSON.stringify(details)} - ${new Date().toISOString()}`);
};

module.exports = {
    logger,
    logSyncEvent,
};
