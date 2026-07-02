const submissionService = require("../services/submission.service");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

/**
 * GET /api/submissions
 */
exports.getAllSubmissions = asyncHandler(async (req, res) => {
    const submissions = await submissionService.getAllSubmissions();

    res.status(200).json({
        success: true,
        submissions
    });
});

/**
 * GET /api/submissions/:id
 */
exports.getSubmissionById = asyncHandler(async (req, res) => {
    const submission = await submissionService.getSubmissionById(req.params.id);

    res.status(200).json({
        success: true,
        submission
    });
});

/**
 * POST /api/submissions
 */
exports.createSubmission = asyncHandler(async (req, res) => {
    const submission = await submissionService.createSubmission(
        req.body,
        req.user.id
    );

    res.status(201).json({
        success: true,
        message: "Submission created successfully",
        submission
    });
});

/**
 * PUT /api/submissions/:id
 */
exports.updateSubmission = asyncHandler(async (req, res) => {
    const submission = await submissionService.updateSubmission(
        req.params.id,
        req.user.id,
        req.body
    );

    res.status(200).json({
        success: true,
        message: "Submission updated successfully",
        submission
    });
});

/**
 * DELETE /api/submissions/:id
 */
exports.deleteSubmission = asyncHandler(async (req, res) => {
    const result = await submissionService.deleteSubmission(
        req.params.id,
        req.user.id
    );

    res.status(200).json({
        success: true,
        message: result.message
    });
});

/**
 * PUT /api/submissions/:id/github
 */
exports.updateGithubUrl = asyncHandler(async (req, res) => {

    const submission = await submissionService.updateGithubUrl(
        req.params.id,
        req.user.id,
        req.body.github_url
    );

    res.status(200).json({
        success: true,
        message: "GitHub link updated successfully",
        submission
    });
});

/**
 * PUT /api/submissions/:id/figma
 */
exports.updateFigmaUrl = asyncHandler(async (req, res) => {

    const submission = await submissionService.updateFigmaUrl(
        req.params.id,
        req.user.id,
        req.body.figma_url
    );

    res.status(200).json({
        success: true,
        message: "Figma link updated successfully",
        submission
    });
});

/**
 * PUT /api/submissions/:id/presentation
 */
exports.updatePresentation = asyncHandler(async (req, res) => {

    if (!req.file) {
        throw new AppError("No presentation uploaded", 400);
    }

    const presentationPath = `uploads/presentations/${req.file.filename}`;

    const submission = await submissionService.updatePresentation(
        req.params.id,
        req.user.id,
        presentationPath
    );

    res.status(200).json({
        success: true,
        message: "Presentation uploaded successfully",
        submission
    });
});

module.exports = {
    getAllSubmissions: exports.getAllSubmissions,
    getSubmissionById: exports.getSubmissionById,
    createSubmission: exports.createSubmission,
    updateSubmission: exports.updateSubmission,
    deleteSubmission: exports.deleteSubmission,
    updateGithubUrl: exports.updateGithubUrl,
    updateFigmaUrl: exports.updateFigmaUrl,
    updatePresentation: exports.updatePresentation
};