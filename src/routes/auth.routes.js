const express = require("express");

const controller = require("../controllers/auth.controller");

const router = express.Router();

const validate = require("../middleware/validate.middleware");

const {
    registerValidator,
    loginValidator
} = require("../validators/auth.validator");

router.post(
    "/register",
    registerValidator,
    validate,
    controller.register
);

router.post(
    "/login",
    loginValidator,
    validate,
    controller.login
);

module.exports = router;