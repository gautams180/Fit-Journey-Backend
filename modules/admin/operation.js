const Database = require("../../services/helper/database");
const Response = require("../../services/helper/response");
const jwt = require("jsonwebtoken");
const ENV = process.env;
const secret = ENV.JWT_SECRET;
let CONSTANTS = require("../../services/helper/constants");
const async = require("async");

let self = (module.exports = {

  fetchWorkoutCategories: async function () {
    return new Promise(async (resolve, reject) => {
      try {
        let query = `SELECT * FROM ${CONSTANTS.TABLES.CATEGORY}`;
        const response = await Database.fetch(query);
        console.log("Response", response);

        resolve({
          ...Response.success,
          categories: response.result
        })
      }
      catch (e) {
        console.log(e);
        reject(e);
      }
    })
  },

  createVariation: async function (name, sets) {
    return new Promise(async (resolve, reject) => {
      let connection = await Database.getConnection();
      try {
        connection = await Database.beginTransaction(connection);

        let variation_query = `
          INSERT INTO ${CONSTANTS.TABLES.WORKOUT} 
          (name)
          VALUES ('${name}')
      `;

        const variation_response = await Database.insert(variation_query, [], connection);
        console.log("variation_response", variation_response);

        if (variation_response.code !== 200) {
          resolve({
            ...Response.internal_server_error,
            message: "Error while inserting workout"
          })
        };

        const workout_id = variation_response.result;

        //insert sets
        const values = sets.map((set, index) => [
          index + 1,
          workout_id,
          set.weight,
          set.plates,
          set.reps
        ]);

        const sets_query = `
            INSERT INTO ${CONSTANTS.TABLES.SETS}
            (set_count, workout_id, weight, plates, reps)
            VALUES ?
              `;

        const sets_response = await Database.insert(sets_query, [values], connection);

        console.log("sets_response", sets_response);

        if (sets_response.code !== 200) {
          resolve({
            ...Response.internal_server_error,
            message: "Error while inserting sets"
          })
        };

        await Database.commitConnection(connection);
        resolve({
          ...Response.success,
        })
      }
      catch (e) {
        console.log(e)
        reject(e);
      }
      finally {
        connection.release();
      }
    })
  },

  addWorkoutToSchedule: async function (workout_id, day_id, category_id) {
    return new Promise(async (resolve, reject) => {
      let connection = await Database.getConnection();
      try {
        connection = await Database.beginTransaction(connection);

        // SQL Query to insert into schedule table
        const schedule_query = `
        INSERT INTO ${CONSTANTS.TABLES.SCHEDULE}
        (workout_id, day_id, category_id)
        VALUES (?, ?, ?)
      `;

        const schedule_response = await Database.insert(schedule_query, [workout_id, day_id, category_id], connection);

        console.log("schedule_response", schedule_response);

        if (schedule_response.code !== 200) {
          resolve({
            ...Response.internal_server_error,
            message: "Error while inserting schedule"
          });
        }

        await Database.commitConnection(connection);
        resolve({
          ...Response.success,
          message: "Workout successfully added to schedule"
        });
      } catch (e) {
        console.log(e);
        connection.release();
        reject(e);
      } finally {
        connection.release();
      }
    });
  },

  removeWorkoutFromSchedule: async function (schedule_id) {
    return new Promise(async (resolve, reject) => {
      let connection = await Database.getConnection();
      try {
        connection = await Database.beginTransaction(connection);

        let remove_query = `DELETE FROM ${CONSTANTS.TABLES.SCHEDULE} WHERE schedule_id = ${schedule_id}`;

        const remove_response = await Database.update(remove_query);

        if (remove_response.code !== 200) {
          resolve({
            ...Response.internal_server_error,
            message: "Error while removing workout from schedule"
          });
          return;
        };

        await Database.commitConnection(connection);
        resolve({
          ...Response.success,
          message: "Workout Removed Successfully"
        })

      }
      catch (e) {
        console.log(e);
        reject(e);
      }
      finally {
        connection.release();
      }
    })
  },

  getWorkoutSchedule: async function () {
    return new Promise(async (resolve, reject) => {
      try {
        const day_id = new Date().getDay() + 1;
        // console.log("day_id", day_id);

        let schedule_query = `
          SELECT
          d.name as day, sch.schedule_id, 
          w.workout_id as workout_id, w.name, w.muscle_targetted,
          s.set_id as set_id, s.set_count, s.weight, s.plates, s.reps,
          c.name as category
          FROM ${CONSTANTS.TABLES.SCHEDULE} sch
          LEFT JOIN ${CONSTANTS.TABLES.WEEK_DAY} d ON sch.day_id = d.id
          LEFT JOIN ${CONSTANTS.TABLES.WORKOUT} w ON sch.workout_id = w.workout_id
          LEFT JOIN ${CONSTANTS.TABLES.SETS} s ON s.workout_id = w.workout_id
          LEFT JOIN ${CONSTANTS.TABLES.CATEGORY} c ON sch.category_id = c.id
        `;

        const schedule_response = await Database.fetch(schedule_query);

        console.log("schedule_response", schedule_response);

        if (schedule_response.code !== 200) {
          resolve({
            ...Response.internal_server_error,
            message: "Error while getting schedule"
          });
        };

        let scheduleMap = {};

        schedule_response.result.forEach((row) => {
          if (!scheduleMap[row.day]) {
            scheduleMap[row.day] = {
              day: row.day,
              categories: {}
            };
          };

          if (row.category) {
            if (!scheduleMap[row.day].categories[row.category]) {
              scheduleMap[row.day].categories[row.category] = {
                category: row.category,
                workouts: {}
              };
            };
          };

          if (row.workout_id) {
            if (!scheduleMap[row.day].categories[row.category].workouts[row.workout_id]) {
              scheduleMap[row.day].categories[row.category].workouts[row.workout_id] = {
                workout_id: row.workout_id,
                name: row.name,
                muscle_targetted: row.muscle_targetted,
                schedule_id: row.schedule_id,
                sets: {}
              };
            };
          };

          if (row.set_id) {
            if (!scheduleMap[row.day].categories[row.category].workouts[row.workout_id].sets[row.set_id]) {
              scheduleMap[row.day].categories[row.category].workouts[row.workout_id].sets[row.set_id] = {
                set_id: row.set_id,
                set_count: row.set_count,
                weight: row.weight,
                plates: row.plates,
                reps: row.reps
              };
            };
          };
        });

        const schedule = Object.values(scheduleMap).map((item) => ({
          day: item.day,
          categories: Object.values(item.categories).map((c) => ({
            category: c.category,
            workouts: Object.values(c.workouts).map((w) => ({
              workout_id: w.workout_id,
              name: w.name,
              muscle_targetted: w.muscle_targetted,
              schedule_id: w.schedule_id,
              sets: Object.values(w.sets).map((s) => ({
                set_id: s.set_id,
                set_count: s.set_count,
                weight: s.weight,
                plates: s.plates,
                reps: s.reps
              }))
            }))
          }))
        }))

        resolve({
          ...Response.success,
          schedule: schedule
        })
      }
      catch (e) {
        console.log(e);
        reject(e);
      }
      finally {

      }
    })
  },

  fetchAllWorkouts: async function () {
    return new Promise(async (resolve, reject) => {
      try {

        let workouts_query = `
          SELECT
            w.workout_id, w.name as workout_name, w.muscle_targetted,
            s.set_id, s.set_count, s.weight, s.plates, s.reps
          FROM ${CONSTANTS.TABLES.WORKOUT} w 
          LEFT JOIN ${CONSTANTS.TABLES.SETS} s ON s.workout_id = w.workout_id
        `;

        const workouts_response = await Database.fetch(workouts_query);

        console.log("workouts_response", workouts_response);

        const workoutMap = {};

        workouts_response.result.forEach((item) => {
          if (!workoutMap[item.workout_id]) {

            workoutMap[item.workout_id] = {
              workout_id: item.workout_id,
              workout_name: item.workout_name,
              muscle_targetted: item.muscle_targetted,
              sets: {}
            };
          };

          if (item.set_id) {
            if (!workoutMap[item.workout_id].sets[item.set_id]) {

              workoutMap[item.workout_id].sets[item.set_id] = {
                set_id: item.set_id,
                set_count: item.set_count,
                weight: item.weight,
                plates: item.plates,
                reps: item.reps,
              };

            };
          };
        });

        console.log("workoutMap", workoutMap[40].sets);

        const workouts = Object.values(workoutMap).map((w) => ({
          workout_id: w.workout_id,
          workout_name: w.workout_name,
          muscle_targetted: w.muscle_targetted,
          sets: Object.values(w.sets).map((s) => ({
            set_id: s.set_id,
            set_count: s.set_count,
            weight: s.weight,
            plates: s.plates,
            reps: s.reps,
          }))
        }));

        resolve({
          ...Response.success,
          workouts: workouts
        });


      }
      catch (e) {
        console.log(e);
        reject(e);
      }
      finally {

      }
    })
  },

  editWorkout: async function (workout_id, name, sets) {
    return new Promise(async (resolve, reject) => {
      let connection = await Database.getConnection();
      try {
        connection = await Database.beginTransaction(connection);

        let workout_exists_query = `SELECT * FROM ${CONSTANTS.TABLES.WORKOUT} WHERE workout_id = ${workout_id}`;
        const workout_exists_response = await Database.fetch(workout_exists_query, [], connection);

        if (workout_exists_response.result.length === 0) {
          resolve({
            ...Response.does_not_exist,
            message: "Workout not found"
          });
          return;
        };

        //update name
        let workout_update_query = `UPDATE ${CONSTANTS.TABLES.WORKOUT}
                                    SET name = '${name}'
                                    WHERE workout_id = ${workout_id}`;
        const workout_update_response = await Database.update(workout_update_query, [], connection);

        if (workout_update_response.code !== 200) {
          resolve({
            ...Response.internal_server_error,
            message: "Error while updating workout"
          });
          return;
        };

        //update sets
        for (const set of sets) {
          let set_update_query = `UPDATE ${CONSTANTS.TABLES.SETS}
                                  SET weight = ${set.weight}, plates = ${set.plates}, reps = ${set.reps}
                                  WHERE set_id = ${set.set_id}`;
          const set_update_response = await Database.update(set_update_query, [], connection);
          if (set_update_response.code !== 200) {
            resolve({
              ...Response.internal_server_error,
              message: `Error while updating set with set ID ${set.set_id}`
            });
            return;
          }
        }

        await Database.commitConnection(connection);
        resolve({
          ...Response.success,
          message: "Workout Updated Successfully"
        })

      }
      catch (e) {
        console.log(e);
        reject(e);
      }
      finally {
        connection.release();
      }
    })
  }


});
