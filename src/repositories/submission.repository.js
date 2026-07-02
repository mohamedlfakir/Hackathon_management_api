const db = require("../config/database");

/**
 * Get all submissions
 */
async function findAll() {
    return db.any(
        `
        SELECT
            s.*,
            t.name AS team_name,
            h.id AS hackathon_id,
            h.title AS hackathon_title
        FROM submissions s
        JOIN teams t
            ON t.id = s.team_id
        JOIN hackathons h
            ON h.id = t.hackathon_id
        ORDER BY s.created_at DESC
        `
    );
}

/**
 * Get submission by id
 */
async function findById(id) {
    return db.oneOrNone(
        `
        SELECT
            s.*,
            t.name AS team_name,
            h.id AS hackathon_id,
            h.title AS hackathon_title
        FROM submissions s
        JOIN teams t
            ON t.id = s.team_id
        JOIN hackathons h
            ON h.id = t.hackathon_id
        WHERE s.id = $1
        `,
        [id]
    );
}

/**
 * Get submission by team
 */
async function findByTeam(teamId) {
    return db.oneOrNone(
        `
        SELECT *
        FROM submissions
        WHERE team_id = $1
        `,
        [teamId]
    );
}

/**
 * Create submission
 */
async function create(data) {
    return db.one(
        `
        INSERT INTO submissions (
            team_id,
            title,
            description,
            github_url,
            figma_url,
            presentation_path
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
        [
            data.team_id,
            data.title,
            data.description,
            data.github_url,
            data.figma_url,
            data.presentation_path
        ]
    );
}

/**
 * Update submission
 */
async function update(id, data) {
    return db.one(
        `
        UPDATE submissions
        SET
            title = $2,
            description = $3,
            github_url = $4,
            figma_url = $5,
            presentation_path = $6,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
        `,
        [
            id,
            data.title,
            data.description,
            data.github_url,
            data.figma_url,
            data.presentation_path
        ]
    );
}

/**
 * Delete submission
 */
async function deleteSubmission(id) {
    return db.result(
        `
        DELETE
        FROM submissions
        WHERE id = $1
        `,
        [id]
    );
}

/**
 * Update presentation file
 */
async function updatePresentation(id, presentationPath) {
    return db.one(
        `
        UPDATE submissions
        SET
            presentation_path = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
        `,
        [id, presentationPath]
    );
}

async function findByHackathon(hackathonId) {
    return db.any(
        `
        SELECT
            s.*,
            t.name AS team_name
        FROM submissions s
        JOIN teams t
            ON t.id = s.team_id
        WHERE t.hackathon_id = $1
        ORDER BY s.created_at
        `,
        [hackathonId]
    );
}

async function updateGithubUrl(id, githubUrl) {
    return db.one(
        `
        UPDATE submissions
        SET
            github_url = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
        `,
        [id, githubUrl]
    );
}

async function updateFigmaUrl(id, figmaUrl) {
    return db.one(
        `
        UPDATE submissions
        SET
            figma_url = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
        `,
        [id, figmaUrl]
    );
}

module.exports = {
    findAll,
    findById,
    findByTeam,
    findByHackathon,
    create,
    update,
    deleteSubmission,
    updatePresentation,
    updateGithubUrl,
    updateFigmaUrl
};
