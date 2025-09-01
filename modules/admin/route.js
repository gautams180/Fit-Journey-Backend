const express = require("express");
const router = express.Router();

const authenticator = require("../../services/authentication/authenticator");
const controller = require("./controller");
const validator = require("./validator");
const sanitizer = require("./sanitizer");

router.get(
    "/fetch-workout-categories",
    controller.fetchWorkoutCategories
);

router.post(
    "/create-variation",
    validator.validateCreateVariation,
    controller.createVariation
);

router.get(
    "/get-workout-schedule",
    controller.getWorkoutSchedule
);

router.get(
    "/fetch-all-workouts",
    controller.fetchAllWorkouts
)

router.post(
    "/add-workout-to-schedule",
    validator.validateAddWorkoutToSchedule,
    controller.addWorkoutToSchedule
);

router.delete(
    "/remove-workout-from-schedule",
    validator.validateRemoveWorkoutFromSchedule,
    controller.removeWorkoutFromSchedule
)

router.put(
    "/edit-workout",
    validator.validateEditWorkout,
    controller.editWorkout
)

module.exports = router;
