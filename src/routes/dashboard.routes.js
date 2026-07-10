const express = require("express");

const router = express.Router();

const adminController = require("../controllers/dashboard.controller");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize.middleware");
const validate = require("../middleware/validate.middleware");


router.get(
    "/statistics",
    authenticate,
    authorize("ADMIN", "ORGANIZER"),
    adminController.getDashboardStatistics
);

module.exports = router;