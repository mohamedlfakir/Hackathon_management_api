const evaluationService = require("../services/evaluation.service");
const asyncHandler = require("../utils/asyncHandler");

/**
 * GET /api/evaluations
 */
exports.getAllEvaluations = asyncHandler(async (req, res) => {

    const evaluations = await evaluationService.getAllEvaluations();

    res.status(200).json({
        success: true,
        evaluations
    });

});

/**
 * GET /api/evaluations/:id
 */
exports.getEvaluationById = asyncHandler(async (req, res) => {

    const evaluation = await evaluationService.getEvaluationById(req.params.id);

    res.status(200).json({
        success: true,
        evaluation
    });

});

/**
 * GET /api/evaluations/submission/:submissionId
 */
exports.getSubmissionEvaluations = asyncHandler(async (req, res) => {

    const evaluations = await evaluationService.getSubmissionEvaluations(
        req.params.submissionId
    );

    res.status(200).json({
        success: true,
        evaluations
    });

});

/**
 * POST /api/evaluations
 */
exports.createEvaluation = asyncHandler(async (req, res) => {

    const evaluation = await evaluationService.createEvaluation(
        req.body,
        req.user.id
    );

    res.status(201).json({
        success: true,
        message: "Evaluation created successfully",
        evaluation
    });

});

/**
 * PUT /api/evaluations/:id
 */
exports.updateEvaluation = asyncHandler(async (req, res) => {

    const evaluation = await evaluationService.updateEvaluation(
        req.params.id,
        req.user.id,
        req.body
    );

    res.status(200).json({
        success: true,
        message: "Evaluation updated successfully",
        evaluation
    });

});

/**
 * DELETE /api/evaluations/:id
 */
exports.deleteEvaluation = asyncHandler(async (req, res) => {

    const result = await evaluationService.deleteEvaluation(
        req.params.id,
        req.user.id
    );

    res.status(200).json({
        success: true,
        message: result.message
    });

});

module.exports = {
    getAllEvaluations: exports.getAllEvaluations,
    getEvaluationById: exports.getEvaluationById,
    getSubmissionEvaluations: exports.getSubmissionEvaluations,
    createEvaluation: exports.createEvaluation,
    updateEvaluation: exports.updateEvaluation,
    deleteEvaluation: exports.deleteEvaluation
};