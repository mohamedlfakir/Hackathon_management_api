const { body, param } = require("express-validator");

/**
 * Validate team ID
 */
const teamIdValidator = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Team ID must be a positive integer")
];

/**
 * Create team
 */
const createTeamValidator = [
    body("hackathon_id")
        .isInt({ min: 1 })
        .withMessage("Hackathon ID is required"),

    body("name")
        .trim()
        .notEmpty()
        .withMessage("Team name is required")
        .isLength({ min: 3, max: 100 })
        .withMessage("Team name must be between 3 and 100 characters"),

    body("description")
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage("Description cannot exceed 1000 characters")
];

/**
 * Update team
 */
const updateTeamValidator = [
    body("name")
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage("Team name must be between 3 and 100 characters"),

    body("description")
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage("Description cannot exceed 1000 characters")
];

module.exports = {
    teamIdValidator,
    createTeamValidator,
    updateTeamValidator
};