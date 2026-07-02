const hackathonService = require("../services/hackathon.service");
const asyncHandler = require("../utils/asyncHandler");

/**
 * GET /api/hackathons
 */
exports.getAllHackathons = asyncHandler(async (req, res) => {
    const hackathons = await hackathonService.getAllHackathons();

    res.status(200).json({
        success: true,
        hackathons
    });
});

/**
 * GET /api/hackathons/:id
 */
exports.getHackathonById = asyncHandler(async (req, res) => {
    const hackathon = await hackathonService.getHackathonById(req.params.id);

    res.status(200).json({
        success: true,
        hackathon
    });
});

/**
 * POST /api/hackathons
 */
exports.createHackathon = asyncHandler(async (req, res) => {
    const hackathon = await hackathonService.createHackathon(
        req.body,
        req.user.id
    );

    res.status(201).json({
        success: true,
        message: "Hackathon created successfully",
        hackathon
    });
});

/**
 * PUT /api/hackathons/:id
 */
exports.updateHackathon = asyncHandler(async (req, res) => {
    const hackathon = await hackathonService.updateHackathon(
        req.params.id,
        req.body
    );

    res.status(200).json({
        success: true,
        message: "Hackathon updated successfully",
        hackathon
    });
});

/**
 * DELETE /api/hackathons/:id
 */
exports.deleteHackathon = asyncHandler(async (req, res) => {
    const result = await hackathonService.deleteHackathon(req.params.id);

    res.status(200).json({
        success: true,
        message: result.message
    });
});

/**
 * POST /api/hackathons/:id/register
 */
exports.registerParticipant = asyncHandler(async (req, res) => {
    const registration = await hackathonService.registerParticipant(
        req.params.id,
        req.user.id
    );

    res.status(201).json({
        success: true,
        message: "Successfully registered for the hackathon",
        registration
    });
});

/**
 * DELETE /api/hackathons/:id/register
 */
exports.unregisterParticipant = asyncHandler(async (req, res) => {
    const result = await hackathonService.unregisterParticipant(
        req.params.id,
        req.user.id
    );

    res.status(200).json({
        success: true,
        message: result.message
    });
});

/**
 * GET /api/hackathons/:id/participants
 */
exports.getParticipants = asyncHandler(async (req, res) => {
    const participants = await hackathonService.getParticipants(
        req.params.id
    );

    res.status(200).json({
        success: true,
        participants
    });
});

module.exports = {
    getAllHackathons: exports.getAllHackathons,
    getHackathonById: exports.getHackathonById,
    createHackathon: exports.createHackathon,
    updateHackathon: exports.updateHackathon,
    deleteHackathon: exports.deleteHackathon,
    registerParticipant: exports.registerParticipant,
    unregisterParticipant: exports.unregisterParticipant,
    getParticipants: exports.getParticipants
};