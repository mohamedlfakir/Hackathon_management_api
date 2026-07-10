const hackathonRepository = require("../repositories/hackathon.repository");
const userRepository = require("../repositories/user.repository");

const AppError = require("../utils/AppError");  

/**
 * Get all hackathons
 */
async function getAllHackathons() {
    return await hackathonRepository.findAll();
}

/**
 * Get hackathon by id
 */
async function getHackathonById(id) {
    const hackathon = await hackathonRepository.findById(id);

    if (!hackathon) {
        throw new AppError("Hackathon not found", 404);
    }

    return hackathon;
}


/**
 * Get all upcoming hackathons
 */
async function getUpcomingHackathons() {
    return await hackathonRepository.findUpcoming();
}

/**
 * Get all active hackathons
 */
async function getActiveHackathons() {
    return await hackathonRepository.findActive();
}

/**
 * Get active/upcoming hackathons registered by the authenticated user
 */
async function getActiveHackathonsByUser(userId) {
    return await hackathonRepository.findActiveHackathonsByUser(userId);
}

/**
 * Get finished hackathons registered by the authenticated user
 * including their ranking
 */
async function getFinishedHackathonsByUser(userId) {
    return await hackathonRepository.findFinishedHackathonsByUser(userId);
}


/**
 * Create hackathon
 */
async function createHackathon(data, createdBy) {

    if (new Date(data.start_date) >= new Date(data.end_date)) {
    throw new AppError(
        "Start date must be before end date",
        400
    );
    }

    if (
        new Date(data.registration_deadline) <
        new Date(data.start_date)
    ) {
        throw new AppError(
            "Registration deadline must be after the start date",
            400
        );
    }

    return await hackathonRepository.create({
        ...data,
        created_by: createdBy,
        status: data.status || "UPCOMING"
    });

}

/**
 * Update hackathon
 */
async function updateHackathon(id, data) {

    const hackathon = await hackathonRepository.findById(id);

    if (!hackathon) {
        throw new AppError("Hackathon not found", 404);
    }

    return await hackathonRepository.update(id, {
        title: data.title ?? hackathon.title,
        theme: data.theme ?? hackathon.theme,
        description: data.description ?? hackathon.description,
        rules: data.rules ?? hackathon.rules,
        location: data.location ?? hackathon.location,
        is_online: data.is_online ?? hackathon.is_online,
        start_date: data.start_date ?? hackathon.start_date,
        end_date: data.end_date ?? hackathon.end_date,
        registration_deadline:
        data.registration_deadline ?? hackathon.registration_deadline,
        status: data.status ?? hackathon.status
    });

}

/**
 * Delete hackathon
 */
async function deleteHackathon(id) {

    const hackathon = await hackathonRepository.findById(id);

    if (!hackathon) {
        throw new AppError("Hackathon not found", 404);
    }

    await hackathonRepository.deleteHackathon(id);

    return {
        message: "Hackathon deleted successfully"
    };

}

/**
 * Register participant
 */
async function registerParticipant(hackathonId, userId) {

    const hackathon = await hackathonRepository.findById(hackathonId);

    if (!hackathon) {
        throw new AppError("Hackathon not found", 404);
    }

    if (new Date(hackathon.registration_deadline) < new Date()) {
        throw new AppError("Registration deadline has passed", 400);
    }

    const exists = await hackathonRepository.isParticipant(
        hackathonId,
        userId
    );

    if (exists) {
        throw new AppError(
            "You are already registered for this hackathon",
            409
        );
    }

    return await hackathonRepository.registerParticipant(
        hackathonId,
        userId
    );

}

/**
 * Unregister participant
 */
async function unregisterParticipant(hackathonId, userId) {

    const hackathon = await hackathonRepository.findById(hackathonId);

    if (!hackathon) {
        throw new AppError("Hackathon not found", 404);
    }

    const exists = await hackathonRepository.isParticipant(
        hackathonId,
        userId
    );

    if (!exists) {
        throw new AppError(
            "You are not registered for this hackathon",
            404
        );
    }

    await hackathonRepository.unregisterParticipant(
        hackathonId,
        userId
    );

    return {
        message: "Registration cancelled successfully"
    };

}

/**
 * Check if authenticated user is a participant in a hackathon
 */
async function isParticipant(hackathonId, userId) {
    const participant = await hackathonRepository.isParticipant(
        hackathonId,
        userId
    );

    return {
        isParticipant: !!participant
    };
}

/**
 * Get solo participants
 */
async function getSoloParticipants(hackathonId) {

    const hackathon = await hackathonRepository.findById(hackathonId);

    if (!hackathon) {
        throw new AppError("Hackathon not found", 404);
    }

    return await hackathonRepository.getSoloParticipants(hackathonId);

}

/**
 * Assign judge to hackathon
 */
async function assignJudge(hackathonId, judgeId) {

    const hackathon = await hackathonRepository.findById(hackathonId);

    if (!hackathon) {
        throw new AppError("Hackathon not found", 404);
    }

    const judge = await userRepository.findById(judgeId);

    if (!judge) {
        throw new AppError("Judge not found", 404);
    }

    if (judge.role !== "JUDGE") {
        throw new AppError("User is not a judge", 400);
    }

    const assignment = await hackathonRepository.assignJudge(
        hackathonId,
        judgeId
    );

    if (!assignment) {
        throw new AppError(
            "Judge is already assigned to this hackathon",
            409
        );
    }

    return assignment;
}

/**
 * Remove judge from hackathon
 */
async function removeJudge(hackathonId, judgeId) {

    const result = await hackathonRepository.removeJudge(
        hackathonId,
        judgeId
    );

    if (result.rowCount === 0) {
        throw new AppError("Assignment not found", 404);
    }

    return {
        message: "Judge removed successfully"
    };
}

/**
 * Get judges for a hackathon
 */
async function getHackathonJudges(hackathonId) {

    const hackathon = await hackathonRepository.findById(hackathonId);

    if (!hackathon) {
        throw new AppError("Hackathon not found", 404);
    }

    return await hackathonRepository.getHackathonJudges(hackathonId);
}

/**
 * Get hackathons for a judge
 */
async function getJudgeHackathons(judgeId) {

    const judge = await userRepository.findById(judgeId);

    if (!judge) {
        throw new AppError("Judge not found", 404);
    }

    return await hackathonRepository.getJudgeHackathons(judgeId);
}

async function getHackathonTeams(hackathonId) {
    return await hackathonRepository.getHackathonTeams(hackathonId);
}

async function registerTeam(hackathonId, teamId) {
    return await hackathonRepository.registerTeam(hackathonId, teamId);
}

async function unregisterTeam(hackathonId, teamId) {
    return await hackathonRepository.unregisterTeam(hackathonId, teamId);
}

async function getHackathonSubmissions(hackathonId) {
    return await hackathonRepository.getHackathonSubmissions(hackathonId);
}

async function getHackathonParticipants(hackathonId) {
    return await hackathonRepository.getHackathonParticipants(hackathonId);
}

module.exports = {
    getAllHackathons,
    getHackathonById,
    getUpcomingHackathons,
    getActiveHackathons,
    getActiveHackathonsByUser,
    getFinishedHackathonsByUser,
    createHackathon,
    updateHackathon,
    deleteHackathon,
    registerParticipant,
    unregisterParticipant,
    getSoloParticipants,
    assignJudge,
    removeJudge,
    getHackathonJudges,
    getJudgeHackathons,
    getHackathonTeams,
    registerTeam,
    unregisterTeam,
    getHackathonSubmissions,
    getHackathonParticipants,
    isParticipant
};