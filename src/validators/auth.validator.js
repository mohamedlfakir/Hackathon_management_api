const { body } = require("express-validator");

const registerValidator = [
    body("username")
        .trim()
        .notEmpty()
        .withMessage("Username is required"),

    body("email")
        .trim()
        .isEmail()
        .withMessage("Invalid email"),

    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must contain at least 8 characters")
];

const loginValidator = [
    body("email")
        .trim()
        .isEmail()
        .withMessage("Invalid email"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
];

module.exports = {
    registerValidator,
    loginValidator
};