const { body, param } = require("express-validator");

/**
 * Validate evaluation ID
 */
const evaluationIdValidator = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Evaluation ID must be a positive integer")
];

/**
 * Validate submission ID
 */
const submissionIdValidator = [
    param("submissionId")
        .isInt({ min: 1 })
        .withMessage("Submission ID must be a positive integer")
];

/**
 * Validate judge ID
 */
const judgeIdValidator = [
    param("judgeId")
        .isInt({ min: 1 })
        .withMessage("Evaluation ID must be a positive integer")
];

/**
 * Create evaluation
 */
const createEvaluationValidator = [

    body("evaluations.*.comment")
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage("Comments cannot exceed 5000 characters"),

    body("evaluations.*.criterion_id")
        .isInt({ min: 1 })
        .withMessage("Criterion ID must be a positive integer"),

    body("evaluations.*.score")
        .isFloat({ min: 0 })
        .withMessage("Score must be a positive number")
];

/**
 * Update evaluation
 */
const updateEvaluationValidator = [

    body("comments")
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage("Comments cannot exceed 5000 characters"),

    body("scores")
        .optional()
        .isArray()
        .withMessage("Scores must be an array"),

    body("scores.*.criterion_id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Criterion ID must be a positive integer"),

    body("scores.*.score")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Score must be a positive number")
];

module.exports = {
    evaluationIdValidator,
    submissionIdValidator,
    createEvaluationValidator,
    updateEvaluationValidator
};