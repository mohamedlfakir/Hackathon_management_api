const db = require("../config/database");

/**
 * Get all hackathons
 */
async function findAll() {
    return db.any(
        `
        SELECT
            h.*,
            CONCAT(u.first_name, ' ', u.last_name) AS organizer
        FROM hackathons h
        JOIN users u
            ON u.id = h.created_by
        ORDER BY h.start_date ASC
        `
    );
}

/**
 * Get hackathon by id
 */
async function findById(id) {
    return db.oneOrNone(
        `
        SELECT
            h.*,
            CONCAT(u.first_name, ' ', u.last_name) AS organizer
        FROM hackathons h
        JOIN users u
            ON u.id = h.created_by
        WHERE h.id = $1
        `,
        [id]
    );
}

/**
 * Create hackathon
 */
async function create(data) {
    return db.one(
        `
        INSERT INTO hackathons (

            title,

            theme,

            description,

            rules,

            location,

            is_online,

            start_date,

            end_date,

            registration_deadline,

            status,

            created_by

        )

        VALUES (

            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11

        )

        RETURNING *
        `,
        [
            data.title,
            data.theme,
            data.description,
            data.rules,
            data.location,
            data.is_online,
            data.start_date,
            data.end_date,
            data.registration_deadline,
            data.status,
            data.created_by
        ]
    );
}

/**
 * Update hackathon
 */
async function update(id, data) {
    return db.one(
        `
        UPDATE hackathons

        SET

            title = $2,

            theme = $3,

            description = $4,

            rules = $5,

            location = $6,

            is_online = $7,

            start_date = $8,

            end_date = $9,

            registration_deadline = $10,

            status = $11

        WHERE id = $1

        RETURNING *
        `,
        [
            id,
            data.title,
            data.theme,
            data.description,
            data.rules,
            data.location,
            data.is_online,
            data.start_date,
            data.end_date,
            data.registration_deadline,
            data.status
        ]
    );
}

/**
 * Delete hackathon
 */
async function deleteHackathon(id) {
    return db.result(
        `
        DELETE
        FROM hackathons
        WHERE id = $1
        `,
        [id]
    );
}

/**
 * Register participant
 */
async function registerParticipant(hackathonId, userId) {
    return db.one(
        `
        INSERT INTO hackathon_participants (

            hackathon_id,

            user_id

        )

        VALUES ($1,$2)

        RETURNING *
        `,
        [hackathonId, userId]
    );
}

/**
 * Remove participant
 */
async function unregisterParticipant(hackathonId, userId) {
    return db.result(
        `
        DELETE
        FROM hackathon_participants

        WHERE hackathon_id = $1

        AND user_id = $2
        `,
        [hackathonId, userId]
    );
}

/**
 * Get participants
 */
async function getParticipants(hackathonId) {
    return db.any(
        `
        SELECT

            u.id,

            u.username,

            u.first_name,

            u.last_name,

            u.email,

            hp.registered_at

        FROM hackathon_participants hp

        JOIN users u

            ON u.id = hp.user_id

        WHERE hp.hackathon_id = $1

        ORDER BY hp.registered_at
        `,
        [hackathonId]
    );
}

/**
 * Check if user already registered
 */
async function isParticipant(hackathonId, userId) {
    return db.oneOrNone(
        `
        SELECT id

        FROM hackathon_participants

        WHERE hackathon_id = $1

        AND user_id = $2
        `,
        [hackathonId, userId]
    );
}

module.exports = {
    findAll,
    findById,
    create,
    update,
    deleteHackathon,
    registerParticipant,
    unregisterParticipant,
    getParticipants,
    isParticipant
};