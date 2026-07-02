const { body, param } = require("express-validator");

/**
 * Common validation for route parameter :id
 */
const hackathonIdValidator = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Hackathon ID must be a positive integer")
];

/**
 * Create hackathon
 */
const createHackathonValidator = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .isLength({ max: 150 })
        .withMessage("Title cannot exceed 150 characters"),

    body("theme")
        .trim()
        .notEmpty()
        .withMessage("Theme is required")
        .isLength({ max: 150 })
        .withMessage("Theme cannot exceed 150 characters"),

    body("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required"),

    body("rules")
        .trim()
        .optional(),

    body("location")
        .trim()
        .optional(),

    body("is_online")
        .isBoolean()
        .withMessage("is_online must be true or false"),

    body("start_date")
        .isISO8601()
        .withMessage("Invalid start date"),

    body("end_date")
        .isISO8601()
        .withMessage("Invalid end date"),

    body("registration_deadline")
        .isISO8601()
        .withMessage("Invalid registration deadline"),

    body("status")
        .optional()
        .isIn([
            "UPCOMING",
            "OPEN",
            "IN_PROGRESS",
            "FINISHED",
            "CANCELLED"
        ])
        .withMessage("Invalid status")
];

/**
 * Update hackathon
 */
const updateHackathonValidator = [
    body("title")
        .optional()
        .trim()
        .isLength({ max: 150 })
        .withMessage("Title cannot exceed 150 characters"),

    body("theme")
        .optional()
        .trim()
        .isLength({ max: 150 })
        .withMessage("Theme cannot exceed 150 characters"),

    body("description")
        .optional()
        .trim(),

    body("rules")
        .optional()
        .trim(),

    body("location")
        .optional()
        .trim(),

    body("is_online")
        .optional()
        .isBoolean()
        .withMessage("is_online must be true or false"),

    body("start_date")
        .optional()
        .isISO8601()
        .withMessage("Invalid start date"),

    body("end_date")
        .optional()
        .isISO8601()
        .withMessage("Invalid end date"),

    body("registration_deadline")
        .optional()
        .isISO8601()
        .withMessage("Invalid registration deadline"),

    body("status")
        .optional()
        .isIn([
            "UPCOMING",
            "OPEN",
            "IN_PROGRESS",
            "FINISHED",
            "CANCELLED"
        ])
        .withMessage("Invalid status")
    ];

    /*
    * Assign judge to hackathon
    */
    const assignJudgeValidator = [

        body("judge_id")
            .isInt({ min: 1 })
            .withMessage("Judge ID must be a positive integer")

    ];

    /*
    * Remove judge from hackathon
    */
    const judgeIdValidator = [

        param("judgeId")
            .isInt({ min: 1 })
            .withMessage("Judge ID must be a positive integer")

    ];

module.exports = {
    hackathonIdValidator,
    createHackathonValidator,
    updateHackathonValidator,
    assignJudgeValidator,
    judgeIdValidator
};