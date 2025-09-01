const express = require("express");
const router = express.Router();

const admin = require("../../modules/admin/route");

router.use("/admin", admin);

module.exports = router;
