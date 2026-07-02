const db = require("../config/database");

/**
 * Get all teams
 */
async function findAll() {
    return db.any(`
        SELECT
            t.*,
            h.title AS hackathon_title
        FROM teams t
        JOIN hackathons h
            ON h.id = t.hackathon_id
        ORDER BY t.created_at DESC
    `);
}

/**
 * Get team by id
 */
async function findById(id) {
    return db.oneOrNone(
        `
        SELECT
            t.*,
            h.title AS hackathon_title
        FROM teams t
        JOIN hackathons h
            ON h.id = t.hackathon_id
        WHERE t.id = $1
        `,
        [id]
    );
}

/**
 * Create team
 */
async function create(data) {
    return db.one(
        `
        INSERT INTO teams (
            hackathon_id,
            captain_id,
            name,
            description,
            avatar_path
        )
        VALUES ($1,$2,$3,$4,$5)
        RETURNING *;
        `,
        [
            data.hackathon_id,
            data.captain_id,
            data.name,
            data.description,
            data.avatar_path
        ]
    );
}

/**
 * Update team
 */
async function update(id, data) {
    return db.one(
        `
        UPDATE teams
        SET
            name = $2,
            description = $3,
            avatar_path = $4,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
        `,
        [
            id,
            data.name,
            data.description,
            data.avatar_path
        ]
    );
}

/**
 * Delete team
 */
async function deleteTeam(id) {
    return db.result(
        `
        DELETE
        FROM teams
        WHERE id = $1
        `,
        [id]
    );
}

/**
 * Join team
 */
async function joinTeam(teamId, userId) {
    return db.one(
        `
        INSERT INTO team_members (
            team_id,
            user_id
        )
        VALUES ($1, $2)
        RETURNING *
        `,
        [teamId, userId]
    );
}

/**
 * Leave team
 */
async function leaveTeam(teamId, userId) {
    return db.result(
        `
        DELETE
        FROM team_members
        WHERE team_id = $1
        AND user_id = $2
        `,
        [teamId, userId]
    );
}

/**
 * Get members
 */
async function getMembers(teamId) {
    return db.any(
        `
        SELECT
            u.id,
            u.username,
            u.first_name,
            u.last_name,
            u.email,
            u.avatar_path,
            tm.joined_at
        FROM team_members tm
        JOIN users u
            ON u.id = tm.user_id
        WHERE tm.team_id = $1
        ORDER BY tm.joined_at
        `,
        [teamId]
    );
}

/**
 * Check if user is member
 */
async function isMember(teamId, userId) {
    return db.oneOrNone(
        `
        SELECT id
        FROM team_members
        WHERE team_id = $1
        AND user_id = $2
        `,
        [teamId, userId]
    );
}

/**
 * Find user's team in a hackathon
 */
async function findUserTeam(hackathonId, userId) {
    return db.oneOrNone(
        `
        SELECT
            t.*
        FROM teams t
        JOIN team_members tm
            ON tm.team_id = t.id
        WHERE t.hackathon_id = $1
        AND tm.user_id = $2
        `,
        [hackathonId, userId]
    );
}

module.exports = {
    findAll,
    findById,
    create,
    update,
    deleteTeam,
    joinTeam,
    leaveTeam,
    getMembers,
    isMember,
    findUserTeam
};