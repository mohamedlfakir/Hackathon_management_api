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
 * Get all upcoming hackathons
 */
async function findUpcoming() {
    return db.any(
        `
        SELECT
            h.*,
            CONCAT(u.first_name, ' ', u.last_name) AS organizer
        FROM hackathons h
        JOIN users u
            ON u.id = h.created_by
        WHERE h.status = 'UPCOMING'
        ORDER BY h.start_date
        `
    );
}

/**
 * Get all active hackathons
 */
async function findActive() {
    return db.any(
        `
        SELECT
            h.*,
            CONCAT(u.first_name, ' ', u.last_name) AS organizer
        FROM hackathons h
        JOIN users u
            ON u.id = h.created_by
        WHERE h.status = 'OPEN'
        ORDER BY h.start_date
        `
    );
}


/**
 * Get active/upcoming hackathons registered by the user
 */
async function findActiveHackathonsByUser(userId) {
    return db.any(
        `
        SELECT DISTINCT

            h.*,

            CONCAT(o.first_name, ' ', o.last_name) AS organizer,

            CASE
                WHEN hp.team_id IS NULL THEN 'SOLO'
                ELSE 'TEAM'
            END AS participant_type,

            t.name AS team_name,

            CASE
                WHEN s.id IS NULL THEN 'NOT_SUBMITTED'
                ELSE 'SUBMITTED'
            END AS submission_status,

            s.title AS project_name

        FROM hackathons h

        JOIN hackathon_participants hp
            ON hp.hackathon_id = h.id

        JOIN users o
            ON o.id = h.created_by

        LEFT JOIN teams t
            ON t.id = hp.team_id

        LEFT JOIN team_members tm
            ON tm.team_id = hp.team_id

        LEFT JOIN submissions s
            ON s.hackathon_id = h.id
            AND (
                (hp.team_id IS NOT NULL AND s.team_id = hp.team_id)
                OR
                (hp.user_id IS NOT NULL AND s.user_id = hp.user_id)
            )

        WHERE
            (
                hp.user_id = $1
                OR tm.user_id = $1
            )
        AND h.status IN ('OPEN', 'CLOSED')

        ORDER BY h.start_date
        `,
        [userId]
    );
}

/**
 * Get finished hackathons registered by the user with ranking
 */
async function findFinishedHackathonsByUser(userId) {
    return db.any(
        `
        WITH submission_scores AS (

            SELECT
                s.id AS submission_id,
                s.hackathon_id,
                s.team_id,
                s.user_id,
                s.title AS project_title,

                COUNT(DISTINCT e.judge_id) AS judges_count,

                COALESCE(SUM(es.score), 0) AS total_score,

                COALESCE(AVG(judge_scores.total), 0) AS average_score

            FROM submissions s

            LEFT JOIN evaluations e
                ON e.submission_id = s.id

            LEFT JOIN evaluations_scores es
                ON es.evaluation_id = e.id

            LEFT JOIN (
                SELECT
                    e.id,
                    SUM(es.score) AS total
                FROM evaluations e
                JOIN evaluations_scores es
                    ON es.evaluation_id = e.id
                GROUP BY e.id
            ) judge_scores
                ON judge_scores.id = e.id

            GROUP BY
                s.id,
                s.hackathon_id,
                s.team_id,
                s.user_id,
                s.title

        ),

        rankings AS (

            SELECT
                *,

                RANK() OVER (
                    PARTITION BY hackathon_id
                    ORDER BY
                        average_score DESC,
                        total_score DESC
                ) AS ranking

            FROM submission_scores

        )

        SELECT DISTINCT

            h.*,

            CONCAT(o.first_name, ' ', o.last_name) AS organizer,

            r.project_title,
            r.total_score,
            r.average_score,
            r.judges_count,
            r.ranking,

            CASE
                WHEN r.team_id IS NULL THEN 'SOLO'
                ELSE 'TEAM'
            END AS participant_type,

            t.name AS team_name

        FROM rankings r

        JOIN hackathons h
            ON h.id = r.hackathon_id

        JOIN users o
            ON o.id = h.created_by

        LEFT JOIN teams t
            ON t.id = r.team_id

        LEFT JOIN team_members tm
            ON tm.team_id = r.team_id

        WHERE
            h.status = 'FINISHED'
        AND (
            r.user_id = $1
            OR tm.user_id = $1
        )

        ORDER BY h.end_date DESC
        `,
        [userId]
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
 * Get solo participants
 */
async function getSoloParticipants(hackathonId) {
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


/**
 * Assign a judge to a hackathon
 */
async function assignJudge(hackathonId, judgeId) {

    return db.oneOrNone(
        `
        INSERT INTO hackathon_judges (
            hackathon_id,
            judge_id
        )
        VALUES ($1, $2)
        ON CONFLICT (hackathon_id, judge_id)
        DO NOTHING
        RETURNING *
        `,
        [
            hackathonId,
            judgeId
        ]
    );

}

/**
 * Remove a judge from a hackathon
 */
async function removeJudge(hackathonId, judgeId) {

    return db.result(
        `
        DELETE
        FROM hackathon_judges
        WHERE hackathon_id = $1
        AND judge_id = $2
        `,
        [
            hackathonId,
            judgeId
        ]
    );

}


/**
 * Check if a judge is assigned to a hackathon
 */
async function isJudgeAssigned(hackathonId, judgeId) {

    return db.oneOrNone(
        `
        SELECT *
        FROM hackathon_judges
        WHERE hackathon_id = $1
        AND judge_id = $2
        `,
        [
            hackathonId,
            judgeId
        ]
    );

}

/**
 * Get all judges assigned to a hackathon
 */
async function getHackathonJudges(hackathonId) {

    return db.any(
        `
        SELECT
            u.id,
            u.username,
            u.first_name,
            u.last_name,
            u.email,
            hj.assigned_at
        FROM hackathon_judges hj
        JOIN users u
            ON u.id = hj.judge_id
        WHERE hj.hackathon_id = $1
        ORDER BY u.first_name, u.last_name
        `,
        [hackathonId]
    );

}

/**
 * Get all hackathons assigned to a judge
 */
async function getJudgeHackathons(judgeId) {

    return db.any(
        `
        SELECT
            h.*,
            hj.assigned_at
        FROM hackathon_judges hj
        JOIN hackathons h
            ON h.id = hj.hackathon_id
        WHERE hj.judge_id = $1
        ORDER BY h.start_date
        `,
        [judgeId]
    );

}


async function getHackathonTeams(hackathonId) {
    return await db.query(
        `
        SELECT t.*
        FROM hackathon_teams ht
        JOIN teams t
            ON t.id = ht.team_id
        WHERE ht.hackathon_id = $1
        ORDER BY t.name 
        `,
        [hackathonId]
    );

}


async function getHackathonParticipants(hackathonId) {
    return await db.query(
        `
        SELECT
            hp.id,
            hp.hackathon_id,
            'USER' AS participant_type,
            u.id AS participant_id,
            u.first_name,
            u.last_name,
            u.email,
            NULL::text AS team_name
        FROM hackathon_participants hp
        JOIN users u
            ON hp.user_id = u.id
        WHERE hp.hackathon_id = $1
          AND hp.user_id IS NOT NULL

        UNION ALL

        SELECT
            hp.id,
            hp.hackathon_id,
            'TEAM' AS participant_type,
            t.id AS participant_id,
            NULL AS first_name,
            NULL AS last_name,
            NULL AS email,
            t.name AS team_name
        FROM hackathon_participants hp
        JOIN teams t
            ON hp.team_id = t.id
        WHERE hp.hackathon_id = $1
          AND hp.team_id IS NOT NULL

        ORDER BY participant_type, participant_id
        `,
        [hackathonId]
    );

}


async function registerTeam(hackathonId, teamId) {
    return await db.query(
        `
        INSERT INTO hackathon_participants (
            hackathon_id,
            team_id
        )
        VALUES ($1, $2)
        RETURNING *
        `,
        [hackathonId, teamId]
    );

}

async function unregisterTeam(hackathonId, teamId) {
    await db.query(
        `
        DELETE
        FROM hackathon_teams
        WHERE hackathon_id = $1
          AND team_id = $2
        `,
        [hackathonId, teamId]
    );
}


async function getHackathonSubmissions(hackathonId) {
    return await db.query(
        `
        SELECT *
        FROM submissions
        WHERE hackathon_id = $1
        ORDER BY submitted_at DESC
        `,
        [hackathonId]
    );

}


module.exports = {
    findAll,
    findById,
    findUpcoming,
    findActive,
    findActiveHackathonsByUser,
    findFinishedHackathonsByUser,
    create,
    update,
    deleteHackathon,
    registerParticipant,
    unregisterParticipant,
    getSoloParticipants,
    isParticipant,
    assignJudge,
    removeJudge,
    isJudgeAssigned,
    getHackathonJudges,
    getJudgeHackathons,
    getHackathonTeams,
    registerTeam,
    unregisterTeam,
    getHackathonSubmissions,
    getHackathonParticipants
};