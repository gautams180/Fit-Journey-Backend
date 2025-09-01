
const generic_logger = require("../../services/logger/generic");
const pino = require("pino");
const logger = pino(
  pino.destination({ dest: "./logs/users.log", sync: false })
);
const Operations = require("./operation");
const Response = require("../../services/helper/response");

try {
  exports.fetchWorkoutCategories = async (req, res, next) => {
    try {
      generic_logger(req, res);

      let response = await Operations.fetchWorkoutCategories();

      logger.info(response, req.method + ":" + req.baseUrl);

      res.status(response.code).json(response);
    } catch (error) {
      logger.error(req.method + ":" + req.url, error);
      res.status(error.code).send(error.result);
    }
  };

  exports.createVariation = async (req, res, next) => {
    try {
      generic_logger(req, res);

      const { name, sets } = req.body;

      let response = await Operations.createVariation(name, sets);

      logger.info(response, req.method + ":" + req.baseUrl);

      res.status(response.code).json(response);
    } catch (error) {
      logger.error(req.method + ":" + req.url, error);
      res.status(error.code).send(error.result);
    }
  };

  exports.getWorkoutSchedule = async (req, res, next) => {
    try {
      generic_logger(req, res);

      let response = await Operations.getWorkoutSchedule();

      logger.info(response, req.method + ":" + req.baseUrl);

      res.status(response.code).json(response);
    } catch (error) {
      logger.error(req.method + ":" + req.url, error);
      res.status(error.code).send(error.result);
    }
  };

  exports.fetchAllWorkouts = async (req, res, next) => {
    try {
      generic_logger(req, res);

      let response = await Operations.fetchAllWorkouts();

      logger.info(response, req.method + ":" + req.baseUrl);

      res.status(response.code).json(response);
    } catch (error) {
      logger.error(req.method + ":" + req.url, error);
      res.status(error.code).send(error.result);
    }
  }

  exports.addWorkoutToSchedule = async (req, res, next) => {
    try {
      generic_logger(req, res);

      const { workout_id, day_id, category_id } = req.body;

      let response = await Operations.addWorkoutToSchedule(workout_id, day_id, category_id);

      logger.info(response, req.method + ":" + req.baseUrl);

      res.status(response.code).json(response);
    } catch (error) {
      logger.error(req.method + ":" + req.url, error);
      res.status(error.code).send(error.result);
    }
  };

  exports.removeWorkoutFromSchedule = async (req, res, next) => {
    try {
      generic_logger(req, res);

      const { schedule_id } = req.query;

      let response = await Operations.removeWorkoutFromSchedule(schedule_id);

      logger.info(response, req.method + ":" + req.baseUrl);

      res.status(response.code).json(response);
    } catch (error) {
      logger.error(req.method + ":" + req.url, error);
      res.status(error.code).send(error.result);
    }
  };

  exports.editWorkout = async (req, res, next) => {
    try {
      generic_logger(req, res);

      const { workout_id, name, sets } = req.body;

      let response = await Operations.editWorkout(workout_id, name, sets);

      logger.info(response, req.method + ":" + req.baseUrl);

      res.status(response.code).json(response);
    } catch (error) {
      logger.error(req.method + ":" + req.url, error);
      res.status(error.code).send(error.result);
    }
  }

} catch (e) {
  console.log(e);
}
