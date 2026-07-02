const express = require("express");

const controller = require("../controllers/auth.controller");

const authenticate = require("../middleware/auth.middleware");

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

router.get(
    "/me",
    authenticate,
    controller.me
);

module.exports = router;