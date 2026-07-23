const { body } = require("express-validator");
const { createUser } = require("../controllers/user.controller");


const createUserValidator = [
    body("email")
        .trim()
        .isEmail()
        .withMessage("Invalid email"),

    body("username")
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage("Username must be between 3 and 50 characters"),

    body("first_name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("First name cannot be empty"),

    body("last_name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Last name cannot be empty"),

    body("bio")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Bio cannot exceed 500 characters")
];


/**
 * Update profile validation
 */
const updateProfileValidator = [
    body("username")
        .optional()
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage("Username must be between 3 and 50 characters"),

    body("first_name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("First name cannot be empty"),

    body("last_name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Last name cannot be empty"),

    body("bio")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Bio cannot exceed 500 characters")
];

/**
 * Change password validation
 */
const changePasswordValidator = [
    body("currentPassword")
        .notEmpty()
        .withMessage("Current password is required"),

    body("newPassword")
        .isLength({ min: 8 })
        .withMessage("New password must be at least 8 characters long")
];

/**
 * Update role validation
 */
const updateRoleValidator = [
    body("role")
        .notEmpty()
        .withMessage("Role is required")
        .isIn([
            "ADMIN",
            "ORGANIZER",
            "PARTICIPANT",
            "JUDGE"
        ])
        .withMessage("Invalid role")
];

/**
 * Update avatar validation
 */
const updateAvatarValidator = [
    body("avatar_path")
        .notEmpty()
        .withMessage("Avatar path is required")
];

module.exports = {
    createUserValidator,
    updateProfileValidator,
    changePasswordValidator,
    updateRoleValidator,
    updateAvatarValidator
};