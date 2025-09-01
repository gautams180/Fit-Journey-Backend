const { body, param, validationResult } = require("express-validator");

module.exports = {
  sanitizeCreate: [
    body("name").trim(),
    body("name").customSanitizer((value) => {
      return value.replace(/'/g, "''");
    }),
    body("address").trim(),
    body("address").customSanitizer((value) => {
      return value.replace(/'/g, "''");
    }),

    body("state").trim(),
    body("state").customSanitizer((value) => {
      return value.replace(/'/g, "''");
    }),
    body("country").trim(),
    body("country").customSanitizer((value) => {
      return value.replace(/'/g, "''");
    }),
    body("registration_type").trim(),
    body("registration_type").customSanitizer((value) => {
      return value.replace(/'/g, "''");
    }),
  ],
  sanitizeFetch: [param("id").trim().toInt()],
  sanitizeUpdate: [
    body("name").trim(),
    body("name").customSanitizer((value) => {
      return value.replace(/'/g, "''");
    }),
    param("id").trim().toInt(),
  ],
  sanitizeDelete: [param("id").trim().toInt()],
  sanitizeBulk: [
    body("data.*.name").trim(),
    body("data.*.name").customSanitizer((value) => {
      return value.replace(/'/g, "''");
    }),
    body("data.*.address").trim(),
    body("data.*.address").customSanitizer((value) => {
      return value.replace(/'/g, "''");
    }),

    body("data.*.state").trim(),
    body("data.*.state").customSanitizer((value) => {
      return value.replace(/'/g, "''");
    }),
    body("data.*.country").trim(),
    body("data.*.country").customSanitizer((value) => {
      return value.replace(/'/g, "''");
    }),
    body("data.*.registration_type").trim(),
    body("data.*.registration_type").customSanitizer((value) => {
      return value.replace(/'/g, "''");
    }),
  ],
};
