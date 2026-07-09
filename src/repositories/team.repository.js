const db = require("../config/database");

/**
 * Get all teams
 */
async function findAll() {
    return db.any(`
        SELECT
            t.*,
            h.title AS hackathon_title,

            json_build_object(
                'id', leader.id,
                'username', leader.username,
                'email', leader.email,
                'first_name', leader.first_name,
                'last_name', leader.last_name
            ) AS leader,

            COALESCE(
                json_agg(
                    DISTINCT jsonb_build_object(
                        'id', member.id,
                        'username', member.username,
                        'email', member.email,
                        'first_name', member.first_name,
                        'last_name', member.last_name
                    )
                ) FILTER (WHERE member.id IS NOT NULL),
                '[]'::json
            ) AS members

        FROM teams t

        JOIN hackathons h
            ON h.id = t.hackathon_id

        JOIN users leader
            ON leader.id = t.leader_id

        LEFT JOIN team_members tm
            ON tm.team_id = t.id

        LEFT JOIN users member
            ON member.id = tm.user_id

        GROUP BY
            t.id,
            h.title,
            leader.id,
            leader.username,
            leader.email,
            leader.first_name,
            leader.last_name

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
            h.title AS hackathon_title,

            json_build_object(
                'id', leader.id,
                'username', leader.username,
                'email', leader.email,
                'first_name', leader.first_name,
                'last_name', leader.last_name
            ) AS leader,

            COALESCE(
                json_agg(
                    DISTINCT jsonb_build_object(
                        'id', member.id,
                        'username', member.username,
                        'email', member.email,
                        'first_name', member.first_name,
                        'last_name', member.last_name
                    )
                ) FILTER (WHERE member.id IS NOT NULL),
                '[]'
            ) AS members

        FROM teams t

        JOIN hackathons h
            ON h.id = t.hackathon_id

        JOIN users leader
            ON leader.id = t.leader_id

        LEFT JOIN team_members tm
            ON tm.team_id = t.id

        LEFT JOIN users member
            ON member.id = tm.user_id

        WHERE t.id = $1

        GROUP BY
            t.id,
            h.title,
            leader.id
        `,
        [id]
    );
}

/**
 * Create team
 */
async function create(data, userId) {
    return db.one(
        `
        INSERT INTO teams (
            hackathon_id,
            leader_id,
            name,
            description,
            avatar_path,
            created_by
        )
        VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING *;
        `,
        [
            data.hackathon_id,
            userId,
            data.name,
            data.description,
            data.avatar_path,
            userId
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
 * Remove member from team
 */
async function removeMember(teamId, userId) {
    return db.none(
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
            t.*,

            json_build_object(
                'id', leader.id,
                'username', leader.username,
                'email', leader.email,
                'first_name', leader.first_name,
                'last_name', leader.last_name
            ) AS leader,

            COALESCE(
                json_agg(
                    DISTINCT jsonb_build_object(
                        'id', member.id,
                        'username', member.username,
                        'email', member.email,
                        'first_name', member.first_name,
                        'last_name', member.last_name
                    )
                ) FILTER (WHERE member.id IS NOT NULL),
                '[]'::json
            ) AS members

        FROM teams t

        JOIN users leader
            ON leader.id = t.leader_id

        JOIN team_members tm_user
            ON tm_user.team_id = t.id
           AND tm_user.user_id = $2

        LEFT JOIN team_members tm
            ON tm.team_id = t.id

        LEFT JOIN users member
            ON member.id = tm.user_id

        WHERE t.hackathon_id = $1

        GROUP BY
            t.id,
            leader.id,
            leader.username,
            leader.email,
            leader.first_name,
            leader.last_name
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
    findUserTeam,
    removeMember
};