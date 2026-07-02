const hackathonRepository = require("../repositories/hackathon.repository");
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
        new Date(data.registration_deadline) >
        new Date(data.start_date)
    ) {
        throw new AppError(
            "Registration deadline must be before or on the start date",
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
 * Get participants
 */
async function getParticipants(hackathonId) {

    const hackathon = await hackathonRepository.findById(hackathonId);

    if (!hackathon) {
        throw new AppError("Hackathon not found", 404);
    }

    return await hackathonRepository.getParticipants(hackathonId);

}

module.exports = {
    getAllHackathons,
    getHackathonById,
    createHackathon,
    updateHackathon,
    deleteHackathon,
    registerParticipant,
    unregisterParticipant,
    getParticipants
};