const Joi = require('joi');
const Response = require("../../services/helper/response");

const createVariationSchema = Joi.object({
  // workout_id: Joi.number()
  //   .required()
  //   .messages({
  //     'any.required': 'Weight is required for each set',
  //     'number.base': 'Weight must be a number'
  //   }),
  name: Joi.string()
    .required()
    .messages({
      'any.required': 'Workout name is required',
      'string.base': 'Workout name must be a string',
      'string.empty': 'Workout name cannot be empty'
    }),

  sets: Joi.array()
    .items(
      Joi.object({
        // set_id: Joi.number()
        //   .min(0)
        //   .required()
        //   .messages({
        //     'any.required': 'Weight is required for each set',
        //     'number.base': 'Weight must be a number'
        //   }),
        weight: Joi.number()
          .min(0)
          .required()
          .messages({
            'any.required': 'Weight is required for each set',
            'number.base': 'Weight must be a number'
          }),

        plates: Joi.number()
          .min(0)
          .required()
          .messages({
            'any.required': 'Plates count is required for each set',
            'number.base': 'Plates must be a number'
          }),

        reps: Joi.number()
          .min(0)
          .required()
          .messages({
            'any.required': 'Reps are required for each set',
            'number.base': 'Reps must be a number'
          })
      })
    )
    .min(1)
    .messages({
      'array.base': 'Sets must be an array',
      'array.min': 'At least one set is required'
    }),

  category_id: Joi.number()
    .required()
    .messages({
      'any.required': 'Category ID is required',
      'number.base': 'Category ID must be a number'
    })
});

const addWorkoutToScheduleSchema = Joi.object({
  workout_id: Joi.number()
    .required()
    .messages({
      'any.required': 'Workout ID is required',
      'number.base': 'Workout ID must be a number'
    }),

  day_id: Joi.number()
    .required()
    .messages({
      'any.required': 'Day ID is required',
      'number.base': 'Day ID must be a number'
    }),

  // category_id: Joi.number()
  //   .required()
  //   .messages({
  //     'any.required': 'Category ID is required',
  //     'number.base': 'Category ID must be a number'
  //   })
});

const removeWorkoutFromScheduleSchema = Joi.object({
  schedule_id: Joi.number()
    .required()
    .messages({
      'any.required': 'Schedule ID is required',
      'number.base': 'Schedule ID must be a number'
    }),
});

const editWorkoutSchema = Joi.object({
  name: Joi.string()
    .trim()
    .required()
    .messages({
      'any.required': 'Workout name is required',
      'string.base': 'Workout name must be a string',
      'string.empty': 'Workout name cannot be empty',
    }),

  workout_id: Joi.number()
    .required()
    .messages({
      'any.required': 'workout_id is required',
      'number.base': 'workout_id must be a number',
    }),

  sets: Joi.array()
    .items(
      Joi.object({
        set_id: Joi.number()
          .required()
          .messages({
            'any.required': 'set_id is required for each set',
            'number.base': 'set_id must be a number',
          }),

        set_count: Joi.number()
          .messages({
            'number.base': 'set_count must be a number',
          }),

        weight: Joi.number()
          .min(0)
          .required()
          .messages({
            'any.required': 'Weight is required for each set',
            'number.base': 'Weight must be a number',
            'number.min': 'Weight cannot be negative',
          }),

        plates: Joi.number()
          .min(0)
          .required()
          .messages({
            'any.required': 'Plates count is required for each set',
            'number.base': 'Plates must be a number',
            'number.min': 'Plates cannot be negative',
          }),

        reps: Joi.number()
          .min(0)
          .required()
          .messages({
            'any.required': 'Reps are required for each set',
            'number.base': 'Reps must be a number',
            'number.min': 'Reps cannot be negative',
          }),
      }).messages({
        'object.base': 'Each set must be an object',
      })
    )
    .messages({
      'array.base': 'sets must be an array',
    }),
});

module.exports = {
  validateCreateVariation: async function (req, res, next) {
    const { name, sets, category_id } = req.body;

    const { value, error } = createVariationSchema.validate({ name, sets, category_id });

    if (error !== undefined) {
      return res
        .status(Response.invalid_value.code)
        .send(error.details)
    }
    next();
  },

  validateAddWorkoutToSchedule: async function (req, res, next) {
    const { workout_id, day_id, category_id } = req.body;

    const { value, error } = addWorkoutToScheduleSchema.validate({
      workout_id,
      day_id,
      // category_id
    });

    if (error) {
      return res
        .status(Response.invalid_value.code)
        .send(error.details);
    }
    next();
  },

  validateRemoveWorkoutFromSchedule: async function (req, res, next) {
    const { schedule_id } = req.query;

    const { value, error } = removeWorkoutFromScheduleSchema.validate({
      schedule_id
    });

    if (error) {
      return res
        .status(Response.invalid_value.code)
        .send(error.details);
    }
    next();
  },

  validateEditWorkout: async function (req, res, next) {
    const { workout_id, name, sets } = req.body;

    const { value, error } = editWorkoutSchema.validate({ workout_id, name, sets });

    if (error !== undefined) {
      return res
        .status(Response.invalid_value.code)
        .send(error.details)
    }
    next();
  },


}
