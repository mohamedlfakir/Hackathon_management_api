const { body, param } = require("express-validator");

/**
 * Validate submission ID
 */
const submissionIdValidator = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Submission ID must be a positive integer")
];

/**
 * Create submission
 */
const createSubmissionValidator = [
    body("hackathon_id")
        .isInt({ min: 1 })
        .withMessage("Hachathon ID is required"),

    body("title")
        .trim()
        .notEmpty()
        .withMessage("Project title is required")
        .isLength({ min: 3, max: 150 })
        .withMessage("Project title must be between 3 and 150 characters"),

    body("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required")
        .isLength({ max: 5000 })
        .withMessage("Description cannot exceed 5000 characters"),

    body("github_url")
        .optional({ nullable: true, checkFalsy: true })
        .isURL()
        .withMessage("GitHub URL is invalid"),

    body("figma_url")
        .optional({ nullable: true, checkFalsy: true })
        .isURL()
        .withMessage("Figma URL is invalid")
];

/**
 * Update submission
 */
const updateSubmissionValidator = [
    body("title")
        .optional()
        .trim()
        .isLength({ min: 3, max: 150 })
        .withMessage("Project title must be between 3 and 150 characters"),

    body("description")
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage("Description cannot exceed 5000 characters")
];

/**
 * Update GitHub URL
 */
const updateGithubValidator = [
    body("github_url")
        .notEmpty()
        .withMessage("GitHub URL is required")
        .isURL()
        .withMessage("GitHub URL is invalid")
        .matches(/^https:\/\/(www\.)?github\.com\/.+/)
        .withMessage("Please provide a valid GitHub repository URL")
];

/**
 * Update Figma URL
 */
const updateFigmaValidator = [
    body("figma_url")
        .notEmpty()
        .withMessage("Figma URL is required")
        .isURL()
        .withMessage("Figma URL is invalid")
        .matches(/^https:\/\/(www\.)?figma\.com\/.+/)
        .withMessage("Please provide a valid Figma link")
];

module.exports = {
    submissionIdValidator,
    createSubmissionValidator,
    updateSubmissionValidator,
    updateGithubValidator,
    updateFigmaValidator
};