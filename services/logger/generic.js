const pino = require("pino");
const { randomUUID } = require("node:crypto");
const logger = require("pino-http")({
  logger: pino(
    pino.destination({ dest: "./logs/generic-logger.log", sync: false })
  ),
  genReqId: function (req, res) {
    const existingID = req.id ?? req.headers["x-request-id"];
    if (existingID) return existingID;
    id = randomUUID();
    res.setHeader("X-Request-Id", id);
    return id;
  },
  transport: {
    target: "pino-pretty",
  },
});

module.exports = logger;
