const db = require("../config/database");

/**
 * Get all evaluations
 */
async function findAll() {
    return db.any(`
        SELECT
            e.*,
            s.title AS submission_title,
            u.username AS judge_name
        FROM evaluations e
        JOIN submissions s
            ON s.id = e.submission_id
        JOIN users u
            ON u.id = e.judge_id
        ORDER BY e.created_at DESC
    `);
}

/**
 * Get evaluation by id
 */
async function findById(id) {
    return db.oneOrNone(`
        SELECT
            e.*,
            s.title AS submission_title,
            u.username AS judge_name
        FROM evaluations e
        JOIN submissions s
            ON s.id = e.submission_id
        JOIN users u
            ON u.id = e.judge_id
        WHERE e.id = $1
    `, [id]);
}

/**
 * Find evaluation by judge and submission
 */
async function findByJudgeAndSubmission(judgeId, submissionId) {
    return db.oneOrNone(`
        SELECT *
        FROM evaluations
        WHERE judge_id = $1
        AND submission_id = $2
    `, [judgeId, submissionId]);
}

/**
 * Create evaluation
 */
async function createEvaluation(data) {
    return db.one(`
        INSERT INTO evaluations (
            submission_id,
            judge_id,
            comment
        )
        VALUES ($1,$2,$3)
        RETURNING *
    `, [
        data.submission_id,
        data.judge_id,
        data.comment ?? null
    ]);
}

/**
 * Update evaluation comment
 */
async function updateEvaluation(id, comment) {
    return db.one(`
        UPDATE evaluations
        SET comment = $2
        WHERE id = $1
        RETURNING *
    `, [id, comment]);
}

/**
 * Create one criterion score
 */
async function createScore(data) {
    return db.one(`
        INSERT INTO evaluations_scores (
            evaluation_id,
            criterion_id,
            score,
            comment
        )
        VALUES ($1,$2,$3,$4)
        RETURNING *
    `, [
        data.evaluation_id,
        data.criterion_id,
        data.score,
        data.comment ?? null
    ]);
}

/**
 * Update one criterion score
 */
async function updateScore(data) {
    return db.one(`
        UPDATE evaluations_scores
        SET
            score = $3,
            comment = $4
        WHERE
            evaluation_id = $1
            AND criterion_id = $2
        RETURNING *
    `, [
        data.evaluation_id,
        data.criterion_id,
        data.score,
        data.comment ?? null
    ]);
}

/**
 * Get all scores of an evaluation
 */
async function getScores(evaluationId) {
    return db.any(`
        SELECT
            es.id,
            es.score,
            es.comment,

            ec.id AS criterion_id,
            ec.code,
            ec.name,
            ec.max_score

        FROM evaluations_scores es
        JOIN evaluation_criteria ec
            ON ec.id = es.criterion_id

        WHERE es.evaluation_id = $1

        ORDER BY ec.id
    `, [evaluationId]);
}

/**
 * Get all evaluations for a submission
 */
async function getSubmissionEvaluations(submissionId) {
    return db.any(`
       SELECT
            u.id AS judge_id,
            u.first_name,
            u.last_name,
            u.avatar_path AS judge_avatar,

            e.created_at AS submitted_at,

            COALESCE(SUM(es.score), 0) AS total_score,

            json_agg(
                json_build_object(
                    'criterion_id', ec.id,
                    'score', es.score,
                    'comment', es.comment
                )
                ORDER BY ec.id
            ) AS scores

        FROM evaluations e

        JOIN users u
            ON u.id = e.judge_id

        JOIN evaluations_scores es
            ON es.evaluation_id = e.id

        JOIN evaluation_criteria ec
            ON ec.id = es.criterion_id

        WHERE e.submission_id = $1

        GROUP BY
            e.id,
            u.id,
            u.first_name,
            u.last_name,
            u.avatar_path,
            e.created_at

        ORDER BY e.created_at
    `, [submissionId]);
}

/**
 * Get one judge evaluations
 */
async function getJudgeEvaluations(submissionId, judgeId) {
    return db.any(`
        SELECT
            e.id AS evaluation_id,
            e.created_at,

            ec.id AS criterion_id,
            ec.code,
            ec.name,
            ec.max_score,

            es.score,
            es.comment

        FROM evaluations e

        JOIN evaluations_scores es
            ON es.evaluation_id = e.id

        JOIN evaluation_criteria ec
            ON ec.id = es.criterion_id

        WHERE
            e.submission_id = $1
            AND e.judge_id = $2

        ORDER BY ec.id
    `, [submissionId, judgeId]);
}

/**
 * Find evaluation (parent)
 */
async function findEvaluation(submissionId, judgeId) {
    return db.oneOrNone(`
        SELECT *
        FROM evaluations
        WHERE
            submission_id = $1
            AND judge_id = $2
    `, [submissionId, judgeId]);
}

/**
 * Get all evaluations of a submission
 */
async function findBySubmission(submissionId) {
    return db.any(`
        SELECT
            e.*,
            u.username,
            u.first_name,
            u.last_name
        FROM evaluations e
        JOIN users u
            ON u.id = e.judge_id
        WHERE e.submission_id = $1
        ORDER BY e.created_at
    `, [submissionId]);
}

/**
 * Delete evaluation
 */
async function deleteEvaluation(id) {
    return db.result(`
        DELETE
        FROM evaluations
        WHERE id = $1
    `, [id]);
}

/**
 * Detailed evaluation
 */
async function findDetailedById(id) {

    const evaluation = await findById(id);

    if (!evaluation) {
        return null;
    }

    evaluation.scores = await getScores(id);

    return evaluation;
}

/**
 * Get all criteria
 */
async function getCriteria() {
    return db.any(`
        SELECT
            id,
            code,
            name,
            max_score
        FROM evaluation_criteria
        ORDER BY id
    `);
}

/**
 * Get criterion by id
 */
async function getCriterionById(id) {
    return db.oneOrNone(`
        SELECT
            id,
            code,
            name,
            max_score
        FROM evaluation_criteria
        WHERE id = $1
    `, [id]);
}


/**
 * Get submissions assigned to a judge that still need evaluation
 */
async function getPendingSubmissions(judgeId) {
    return db.any(`
        SELECT

            s.id,
            s.title,
            s.description,
            s.github_url,
            s.figma_url,
            s.presentation_path,
            s.submitted_at,

            h.id AS hackathon_id,
            h.title AS hackathon_title,

            CASE
                WHEN s.team_id IS NULL THEN 'SOLO'
                ELSE 'TEAM'
            END AS participant_type,

            t.id AS team_id,
            t.name AS team_name,

            u.id AS user_id,
            u.first_name,
            u.last_name,
            u.email

        FROM submissions s

        JOIN hackathon_judges hj
            ON hj.hackathon_id = s.hackathon_id

        JOIN hackathons h
            ON h.id = s.hackathon_id

        LEFT JOIN teams t
            ON t.id = s.team_id

        LEFT JOIN users u
            ON u.id = s.user_id

        WHERE
            hj.judge_id = $1

        AND NOT EXISTS (

            SELECT 1

            FROM evaluations e

            WHERE
                e.submission_id = s.id
            AND e.judge_id = $1

        )

        ORDER BY
            h.end_date,
            s.submitted_at
    `, [judgeId]);
}


/**
 * Count pending submissions for a judge
 */
async function countPendingSubmissions(judgeId) {
    return db.one(`
        SELECT COUNT(*)::int AS total

        FROM submissions s

        JOIN hackathon_judges hj
            ON hj.hackathon_id = s.hackathon_id

        WHERE
            hj.judge_id = $1

        AND NOT EXISTS (

            SELECT 1

            FROM evaluations e

            WHERE
                e.submission_id = s.id
            AND e.judge_id = $1

        )
    `, [judgeId]);
}


/**
 * Get submissions already evaluated by a judge
 */
async function getEvaluatedSubmissions(judgeId) {
    return db.any(`
        SELECT

            s.id,
            s.title,
            s.description,
            s.github_url,
            s.figma_url,
            s.presentation_path,
            s.submitted_at,

            h.id AS hackathon_id,
            h.title AS hackathon_title,

            e.id AS evaluation_id,
            e.created_at AS evaluated_at,

            CASE
                WHEN s.team_id IS NULL THEN 'SOLO'
                ELSE 'TEAM'
            END AS participant_type,

            t.id AS team_id,
            t.name AS team_name,

            u.id AS user_id,
            u.first_name,
            u.last_name,
            u.email,

            COALESCE(SUM(es.score),0) AS total_score

        FROM evaluations e

        JOIN submissions s
            ON s.id = e.submission_id

        JOIN hackathons h
            ON h.id = s.hackathon_id

        LEFT JOIN teams t
            ON t.id = s.team_id

        LEFT JOIN users u
            ON u.id = s.user_id

        LEFT JOIN evaluations_scores es
            ON es.evaluation_id = e.id

        WHERE
            e.judge_id = $1

        GROUP BY
            e.id,
            s.id,
            h.id,
            t.id,
            u.id

        ORDER BY
            evaluated_at DESC
    `, [judgeId]);
}


/**
 * Count evaluated submissions for a judge
 */
async function countEvaluatedSubmissions(judgeId) {
    return db.one(`
        SELECT COUNT(*)::int AS total

        FROM evaluations

        WHERE judge_id = $1
    `, [judgeId]);
}

module.exports = {
    findAll,
    findById,
    findByJudgeAndSubmission,
    findEvaluation,
    createEvaluation,
    updateEvaluation,
    createScore,
    updateScore,
    getScores,
    getSubmissionEvaluations,
    getJudgeEvaluations,
    findBySubmission,
    deleteEvaluation,
    findDetailedById,
    getCriteria,
    getCriterionById,
    getPendingSubmissions,
    countPendingSubmissions,
    getEvaluatedSubmissions,
    countEvaluatedSubmissions
};