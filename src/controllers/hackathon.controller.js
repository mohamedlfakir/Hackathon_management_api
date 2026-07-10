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
 * Get all upcoming hackathons
 */
exports.getUpcomingHackathons = asyncHandler(async (req, res, next) => {

    try {
        const hackathons =
            await hackathonService.getUpcomingHackathons();

         res.status(200).json({
        success: true,
        hackathons
    });
    } catch (error) {
        next(error);
    }
});

/**
 * Get all active hackathons
 */
exports.getActiveHackathons = asyncHandler(async (req, res, next) => {

    try {
        const hackathons =
            await hackathonService.getActiveHackathons();

         res.status(200).json({
        success: true,
        hackathons
    });
    } catch (error) {
        next(error);
    }
}); 
/**
 * Get authenticated user's active/upcoming hackathons
 */
exports.getMyActiveHackathons = asyncHandler(async (req, res, next) => {

    try {
        const hackathons =
            await hackathonService.getActiveHackathonsByUser(
                req.user.id
            );

          res.status(200).json({
        success: true,
        hackathons
    });
    } catch (error) {
        next(error);
    }
});

/**
 * Get authenticated user's finished hackathons
 */

exports.getMyFinishedHackathons = asyncHandler(async (req, res, next) => {

    try {
        const hackathons =
            await hackathonService.getFinishedHackathonsByUser(
                req.user.id
            );

          res.status(200).json({
        success: true,
        hackathons
    });
    } catch (error) {
        next(error);
    }
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


exports.assignUserByAdmin = asyncHandler(async (req, res) => {
    const hackathonId = req.params.id;
    const { userId } = req.body; // Reçu depuis la modale admin

    if (!userId) {
        return res.status(400).json({ 
            success: false, 
            message: "L'identifiant de l'utilisateur (userId) est requis dans le corps de la requête." 
        });
    }

    // On réutilise votre logique de service existante car elle prend déjà les 2 ID en arguments !
    const registration = await hackathonService.registerParticipant(
        hackathonId,
        userId
    );

    res.status(201).json({
        success: true,
        message: "Utilisateur inscrit avec succès au hackathon par l'administrateur.",
        data: registration
    });
});


/**
 * GET /api/hackathons/:id/solo-participants
 */
exports.getSoloParticipants = asyncHandler(async (req, res) => {
    const participants = await hackathonService.getSoloParticipants(
        req.params.id
    );

    res.status(200).json({
        success: true,
        participants
    });
});

/*
* POST /api/hackathons/:id/assign-judge
*/
exports.assignJudge = asyncHandler(async (req, res) => {

    const assignment = await hackathonService.assignJudge(
        req.params.id,
        req.body.judge_id
    );

    res.status(201).json({
        success: true,
        message: "Judge assigned successfully",
        assignment
    });

});

/**
 * Check if authenticated user is registered in a hackathon
 */
exports.isParticipant= asyncHandler(async (req, res) => {
    try {
        const hackathonId = Number(req.params.id);
        const userId = req.user.id;

        const result = await hackathonService.isParticipant(
            hackathonId,
            userId
        );
    

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

/*
* DELETE /api/hackathons/:id/remove-judge
*/
exports.removeJudge = asyncHandler(async (req, res) => {

    const result = await hackathonService.removeJudge(
        req.params.id,
        req.params.judgeId
    );

    res.status(200).json({
        success: true,
        message: result.message
    });

});


/*
* GET /api/hackathons/:id/judges
*/
exports.getHackathonJudges = asyncHandler(async (req, res) => {

    const judges = await hackathonService.getHackathonJudges(
        req.params.id
    );

    res.status(200).json({
        success: true,
        judges
    });

});


/*
* GET /api/judges/:judgeId/hackathons
*/
exports.getJudgeHackathons = asyncHandler(async (req, res) => {

    const hackathons = await hackathonService.getJudgeHackathons(
        req.params.judgeId
    );

    res.status(200).json({
        success: true,
        hackathons
    });

});


exports.getHackathonTeams = asyncHandler(async (req, res, next) => {
    try {
        const hackathonId = Number(req.params.id);

        const teams = await hackathonService.getHackathonTeams(hackathonId);

        res.json(teams);
    } catch (err) {
        next(err);
    }
});

exports.registerTeam = asyncHandler(async (req, res, next) => {
    try {
        const hackathonId = Number(req.params.id);
        const { team_id } = req.body;

        const result = await hackathonService.registerTeam(
            hackathonId,
            team_id
        );

        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
});

exports.unregisterTeam = asyncHandler(async (req, res, next) => {
    try {
        const hackathonId = Number(req.params.id);
        const teamId = Number(req.params.teamId);

        await hackathonService.unregisterTeam(hackathonId, teamId);

        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

exports.getHackathonSubmissions = asyncHandler(async (req, res, next) => {
    try {
        const hackathonId = Number(req.params.id);

        const submissions =
            await hackathonService.getHackathonSubmissions(hackathonId);

        res.status(200).json({
        success: true,
        submissions
    });
    } catch (err) {
        next(err);
    }
});

exports.getHackathonParticipants = asyncHandler(async (req, res, next) => {
    try {
        const hackathonId = Number(req.params.id);

        const participants =
            await hackathonService.getHackathonParticipants(hackathonId);

        res.status(200).json({
        success: true,
        participants
    });

    } catch (error) {

        next(error);
    }
})

// user methods 
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




module.exports = {
    getAllHackathons: exports.getAllHackathons,
    getHackathonById: exports.getHackathonById,
    getUpcomingHackathons: exports.getUpcomingHackathons,
    getActiveHackathons: exports.getActiveHackathons,
    getMyActiveHackathons : exports.getMyActiveHackathons,
    getMyFinishedHackathons: exports.getMyFinishedHackathons,
    createHackathon: exports.createHackathon,
    updateHackathon: exports.updateHackathon,
    deleteHackathon: exports.deleteHackathon,
    assignUserByAdmin: exports.assignUserByAdmin,
    registerParticipant: exports.registerParticipant,
    unregisterParticipant: exports.unregisterParticipant,
    getSoloParticipants: exports.getSoloParticipants,
    assignJudge: exports.assignJudge,
    removeJudge: exports.removeJudge,
    getHackathonJudges: exports.getHackathonJudges,
    getJudgeHackathons: exports.getJudgeHackathons,
    getHackathonTeams: exports.getHackathonTeams,
    registerTeam: exports.registerTeam,
    unregisterTeam: exports.unregisterTeam,
    getHackathonSubmissions: exports.getHackathonSubmissions,
    getHackathonParticipants: exports.getHackathonParticipants,
    isParticipant: exports.isParticipant
};
