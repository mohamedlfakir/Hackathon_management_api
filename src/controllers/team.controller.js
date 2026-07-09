const teamService = require("../services/team.service");
const asyncHandler = require("../utils/asyncHandler");

/**
 * GET /api/teams
 */
exports.getAllTeams = asyncHandler(async (req, res) => {
    const teams = await teamService.getAllTeams();

    res.status(200).json({
        success: true,
        teams
    });
});

/**
 * GET /api/teams/:id
 */
exports.getTeamById = asyncHandler(async (req, res) => {
    const team = await teamService.getTeamById(req.params.id);

    res.status(200).json({
        success: true,
        team
    });
});

/**
 * POST /api/teams
 */
exports.createTeam = asyncHandler(async (req, res) => {
    const team = await teamService.createTeam(
        req.body,
        req.user.id
    );

    res.status(201).json({
        success: true,
        message: "Team created successfully",
        team
    });
});

/**
 * PUT /api/teams/:id
 */
exports.updateTeam = asyncHandler(async (req, res) => {
    const team = await teamService.updateTeam(
        req.params.id,
        req.user.id,
        req.body
    );

    res.status(200).json({
        success: true,
        message: "Team updated successfully",
        team
    });
});

/**
 * DELETE /api/teams/:id
 */
exports.deleteTeam = asyncHandler(async (req, res) => {
    const result = await teamService.deleteTeam(
        req.params.id,
        req.user.id
    );

    res.status(200).json({
        success: true,
        message: result.message
    });
});

/**
 * POST /api/teams/:id/join
 */
exports.joinTeam = asyncHandler(async (req, res) => {
    const membership = await teamService.joinTeam(
        req.params.id,
        req.user.id
    );

    res.status(201).json({
        success: true,
        message: "Successfully joined the team",
        membership
    });
});

/**
 * Remove member from team
 */
exports.removeMember = asyncHandler(async (req, res, nex) => { 
    try {
        const teamId = Number(req.params.id);
        const userId = Number(req.params.userId);

        await teamService.removeMember(
            teamId,
            userId,
            req.user
        );

        res.status(204).send();
    } catch (error) {
        next(error);
    }
});
/**
 * DELETE /api/teams/:id/leave
 */
exports.leaveTeam = asyncHandler(async (req, res) => {
    const result = await teamService.leaveTeam(
        req.params.id,
        req.user.id
    );

    res.status(200).json({
        success: true,
        message: result.message
    });
});

/**
 * GET /api/teams/:id/members
 */
exports.getMembers = asyncHandler(async (req, res) => {
    const members = await teamService.getMembers(req.params.id);

    res.status(200).json({
        success: true,
        members
    });
});

/**
 * PUT /api/teams/:id/avatar
 */
exports.updateAvatar = asyncHandler(async (req, res) => {

    if (!req.file) {
        throw new AppError("No image uploaded", 400);
    }

    const avatarPath = `uploads/teams/${req.file.filename}`;

    const team = await teamService.updateAvatar(
        req.params.id,
        req.user.id,
        avatarPath
    );

    res.status(200).json({
        success: true,
        message: "Team avatar updated successfully",
        team
    });
});

/**
 * Get authenticated user's team in a hackathon
 */
exports.getUserTeam = asyncHandler(async (req, res) => {
    try {
        const hackathonId = Number(req.params.hackathonId);
        const userId = req.user.id;

        const team = await teamService.getUserTeam(
            hackathonId,
            userId
        );

    res.status(200).json({
        success: true,
        team
    });

    } catch (error) {
        next(error);
    }
});

module.exports = {
    getAllTeams: exports.getAllTeams,
    getTeamById: exports.getTeamById,
    createTeam: exports.createTeam,
    updateTeam: exports.updateTeam,
    deleteTeam: exports.deleteTeam,
    joinTeam: exports.joinTeam,
    leaveTeam: exports.leaveTeam,
    getMembers: exports.getMembers,
    updateAvatar: exports.updateAvatar,
    getUserTeam: exports.getUserTeam,
    removeMember: exports.removeMember
};