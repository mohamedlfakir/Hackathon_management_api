const evaluationRepository = require("../repositories/evaluation.repository");
const submissionRepository = require("../repositories/submission.repository");
const teamRepository = require("../repositories/team.repository");
const hackathonRepository = require("../repositories/hackathon.repository");

const AppError = require("../utils/AppError");

/**
 * Get all evaluations
 */
async function getAllEvaluations() {
    return await evaluationRepository.findAll();
}

/**
 * Get evaluation by id
 */
async function getEvaluationById(id) {

    const evaluation = await evaluationRepository.findDetailedById(id);

    if (!evaluation) {
        throw new AppError("Evaluation not found", 404);
    }

    return evaluation;
}

/**
 * Create evaluation
 */
async function createEvaluation(data, judgeId) {

    const submission = await submissionRepository.findById(data.submission_id);

    if (!submission) {
        throw new AppError("Submission not found", 404);
    }

    const team = await teamRepository.findById(submission.team_id);

    if (!team) {
        throw new AppError("Team not found", 404);
    }

    const assigned = await hackathonRepository.isJudgeAssigned(
        team.hackathon_id,
        judgeId
    );

    if (!assigned) {
        throw new AppError(
            "You are not assigned to this hackathon",
            403
        );
    }

    const criteria = await evaluationCriteriaRepository.findAll();

    if (data.scores.length !== criteria.length) {
        throw new AppError(
            "A score is required for every evaluation criterion",
            400
        );
    }

    const existingEvaluation =
        await evaluationRepository.findByJudgeAndSubmission(
            judgeId,
            data.submission_id
        );

    if (existingEvaluation) {
        throw new AppError(
            "You have already evaluated this submission",
            409
        );
    }

    const evaluation = {
        submission_id: data.submission_id,
        judge_id: judgeId,
        comments: data.comments
    };

    return await evaluationRepository.create(
        evaluation,
        data.scores
    );
}

/**
 * Update evaluation
 */
async function updateEvaluation(id, judgeId, data) {

    const evaluation = await evaluationRepository.findById(id);

    if (!evaluation) {
        throw new AppError("Evaluation not found", 404);
    }

    if (evaluation.judge_id !== judgeId) {
        throw new AppError(
            "You can only update your own evaluations",
            403
        );
    }

    return await evaluationRepository.updateEvaluation(
        id,
        data.comments,
        data.scores
    );
}

/**
 * Delete evaluation
 */
async function deleteEvaluation(id, judgeId) {

    const evaluation = await evaluationRepository.findById(id);

    if (!evaluation) {
        throw new AppError("Evaluation not found", 404);
    }

    if (evaluation.judge_id !== judgeId) {
        throw new AppError(
            "You can only delete your own evaluations",
            403
        );
    }

    await evaluationRepository.deleteEvaluation(id);

    return {
        message: "Evaluation deleted successfully"
    };
}

/**
 * Get all evaluations for a submission
 */
async function getSubmissionEvaluations(submissionId) {

    const submission = await submissionRepository.findById(submissionId);

    if (!submission) {
        throw new AppError("Submission not found", 404);
    }

    const evaluations =
        await evaluationRepository.findBySubmission(submissionId);

    for (const evaluation of evaluations) {
        evaluation.scores =
            await evaluationRepository.getScores(evaluation.id);
    }

    return evaluations;
}

module.exports = {
    getAllEvaluations,
    getEvaluationById,
    createEvaluation,
    updateEvaluation,
    deleteEvaluation,
    getSubmissionEvaluations
};