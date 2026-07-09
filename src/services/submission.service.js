const submissionRepository = require("../repositories/submission.repository");
const teamRepository = require("../repositories/team.repository");
const hackathonRepository = require("../repositories/hackathon.repository");

const AppError = require("../utils/AppError");

/**
 * Get all submissions
 */
async function getAllSubmissions() {
    return await submissionRepository.findAll();
}

/**
 * Get submission by id
 */
async function getSubmissionById(id) {

    const submission = await submissionRepository.findById(id);

    if (!submission) {
        throw new AppError("Submission not found", 404);
    }

    return submission;

}

/**
 * Get authenticated user's submission
 */
async function getMySubmission(hackathonId, userId) {
  

    // Check if the user belongs to a team
    const team = await teamRepository.findUserTeam(
        hackathonId,
        userId
    );

    if (team) {
        return await submissionRepository.findByTeam(team.id);
    }

    // Otherwise, return the solo submission
    return await submissionRepository.findByUser(
        hackathonId,
        userId
    );
}

/**
 * Create submission
 */

async function createSubmission(data, userId) {


    const hackathon = await hackathonRepository.findById(
        data.hackathon_id
    );

    if (hackathon.status === "FINISHED") {
        throw new AppError(
            "This hackathon is no longer accepting submissions",
            400
        );
    }

    // TEAM PARTICIPANT
    const team = await teamRepository.findUserTeam(
        data.hackathon_id,
        userId
    );

    if (team) {

        if (team.leader_id !== userId) {
            throw new AppError(
                "Only the team leader can submit the project",
                403
            );
        }

        const existingSubmission =
            await submissionRepository.findByTeam(team.id);

        if (existingSubmission) {
            throw new AppError(
                "This team has already submitted a project",
                409
            );
        }

        return submissionRepository.create({
            ...data,
            hackathon_id: hackathon.id,
            team_id: team.id,
            user_id: null,
            presentation_path: data.presentation_path || null
        });
    }

    // SOLO PARTICIPANT
    const existingSubmission =
        await submissionRepository.findByUser(
            hackathon.id,
            userId
        );

    if (existingSubmission) {
        throw new AppError(
            "You have already submitted a project",
            409
        );
    }

    return submissionRepository.create({
        ...data,
        hackathon_id: hackathon.id,
        user_id: userId,
        team_id: null,
        presentation_path: data.presentation_path || null
    });
}

/**
 * Update submission
 */
async function updateSubmission(id, userId, data) {

    const submission =
        await submissionRepository.findById(id);

    if (!submission) {
        throw new AppError(
            "Submission not found",
            404
        );
    }

    const hackathon =
        await hackathonRepository.findById(
            submission.hackathon_id
        );

    if (hackathon.status === "FINISHED") {
        throw new AppError(
            "Submissions can no longer be modified",
            400
        );
    }

    // TEAM SUBMISSION
    if (submission.team_id) {

        const team = await teamRepository.findById(
            submission.team_id
        );

        if (team.leader_id !== userId) {
            throw new AppError(
                "Only the team leader can update this submission",
                403
            );
        }
    }

    // SOLO SUBMISSION
    if (submission.user_id) {

        if (submission.user_id !== userId) {
            throw new AppError(
                "You can only update your own submission",
                403
            );
        }
    }

    return submissionRepository.update(id, {
        title: data.title ?? submission.title,
        description: data.description ?? submission.description,
        github_url: data.github_url ?? submission.github_url,
        figma_url: data.figma_url ?? submission.figma_url,
        presentation_path:
            data.presentation_path ??
            submission.presentation_path
    });
}
/**
 * Delete submission
 */
async function deleteSubmission(id, userId) {

    const submission = await submissionRepository.findById(id);

    if (!submission) {
        throw new AppError("Submission not found", 404);
    }

    const team = await teamRepository.findById(submission.team_id);

    if (team.captain_id !== userId) {
        throw new AppError(
            "Only the team captain can delete the submission",
            403
        );
    }

    const hackathon = await hackathonRepository.findById(team.hackathon_id);

    if (hackathon.status === "IN_PROGRESS") {
    throw new AppError(
        "Submissions can no longer be modified",
        400
    );
    }

    await submissionRepository.deleteSubmission(id);

    return {
        message: "Submission deleted successfully"
    };

}

/**
 * Upload presentation
 */
async function updatePresentation(id, userId, presentationPath) {

    const submission = await submissionRepository.findById(id);

    if (!submission) {
        throw new AppError("Submission not found", 404);
    }

    const team = await teamRepository.findById(submission.team_id);

    if (team.captain_id !== userId) {
        throw new AppError(
            "Only the team captain can update the presentation",
            403
        );
    }

     const hackathon = await hackathonRepository.findById(team.hackathon_id);

    if (hackathon.status === "IN_PROGRESS") {
    throw new AppError(
        "Submissions can no longer be modified",
        400
    );
    }

    return await submissionRepository.updatePresentation(
        id,
        presentationPath
    );

}

async function updateGithubUrl(id, userId, githubUrl) {

    const submission = await submissionRepository.findById(id);

    if (!submission) {
        throw new AppError("Submission not found", 404);
    }

    const team = await teamRepository.findById(submission.team_id);

    if (team.captain_id !== userId) {
        throw new AppError(
            "Only the team captain can update the GitHub repository",
            403
        );
    }

    const hackathon = await hackathonRepository.findById(team.hackathon_id);

    if (hackathon.status === "IN_PROGRESS") {
    throw new AppError(
        "Submissions can no longer be modified",
        400
    );
    }

    return await submissionRepository.updateGithubUrl(id, githubUrl);
}

async function updateFigmaUrl(id, userId, figmaUrl) {

    const submission = await submissionRepository.findById(id);

    if (!submission) {
        throw new AppError("Submission not found", 404);
    }

    const team = await teamRepository.findById(submission.team_id);

    if (team.captain_id !== userId) {
        throw new AppError(
            "Only the team captain can update the Figma link",
            403
        );
    }

    const hackathon = await hackathonRepository.findById(team.hackathon_id);

    if (hackathon.status === "IN_PROGRESS") {
    throw new AppError(
        "Submissions can no longer be modified",
        400
    );
    }

    return await submissionRepository.updateFigmaUrl(id, figmaUrl);
}

module.exports = {
    getAllSubmissions,
    getSubmissionById,
     getMySubmission,
    createSubmission,
    updateSubmission,
    deleteSubmission,
    updatePresentation,
    updateGithubUrl,
    updateFigmaUrl
};