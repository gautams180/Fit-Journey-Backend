// require("dotenv").config({
//   path: `./environments/${process.env.NODE_ENV}.env`,
// });
require("dotenv").config();
const http = require('http');
const express = require("express");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const path = require("path");
const ENV = process.env;
const compression = require("compression");
// const morgan = require("morgan");
// require("./cron/cron");
app.use(express.static(__dirname + ENV.CLIENT));
const html = ENV.CLIENT;
// const { socketInit } = require('./services/sockets/socket');
const morganMiddleware = require('./logger/morganLogger');
const { logger } = require('./logger/winstonLogger')


const server = http.createServer(app);
// app.use(morganMiddleware);

// Attach Socket.IO to the server
// socketInit(server);

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

app.use(express.static('/client'))
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(compression());

// app.use(morgan("dev"));

app.use(cors());
// app.options("*", cors());

const v1 = require("./apis/versions/v1");

app.use("/v1", v1);

server.listen(ENV.PORT, '0.0.0.0', () => {
  logger.info(`⚙️  Server started on ${ENV.URL}:${ENV.PORT}`);
});


server.timeout = 1000000;

// For viewing static content inside image folder.
app.get("/documents/*", function (req, res, next) {
  if (allowedExt.filter((ext) => req.url.indexOf(ext) > 0).length > 0) {
    res.sendFile(path.resolve(`./${req.url}`));
  } else {
    res.sendFile(path.resolve(`./documents/images/default.jpg`));
  }
});

app.get("/grns/*", function (req, res, next) {
  if (allowedExt.filter((ext) => req.url.indexOf(ext) > 0).length > 0) {
    res.sendFile(path.resolve(`./${req.url}`));
  } else {
    res.sendFile(path.resolve(`./grns/default.png`));
  }
});

// For avoiding favicon request
app.get('/favicon.ico', (req, res) => res.status(204).end());

// For viewing static pages - mainly frontend
app.get("*", function (req, res, next) {
  if (allowedExt.filter((ext) => req.url.indexOf(ext) > 0).length > 0) {
    res.sendFile(path.resolve(ENV.CLIENT + `/${req.url}`));
  } else {
    res.sendFile("index.html", {
      root: html,
    });
  }
});

module.exports = app;
