const ENV = process.env;
const JWT = require("jsonwebtoken");

module.exports = {
  authenticate: async (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    let result;
    if (authorizationHeader) {
      const token = req.headers.authorization.split(" ")[1];
      const SECRET = ENV.JWT_SECRET;
      const options = {};
      try {
        result = JWT.verify(token, SECRET, options);
        req.decoded = result;
        next();
      } catch (error) {
        result = {
          status: 403,
          message: "False token. Please Login again",
        };
        res.status(403).send(result);
      }
    } else {
      result = {
        status: 401,
        message: "Authentication error. Token required.",
      };
      res.status(401).send(result);
    }
  },
};
