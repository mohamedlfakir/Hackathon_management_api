const db = require("../config/database");

/**
 * Get all evaluations
 */
async function findAll() {
    return db.any(
        `
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
        `
    );
}

/**
 * Get evaluation by id
 */
async function findById(id) {
    return db.oneOrNone(
        `
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
        `,
        [id]
    );
}

/**
 * Check if a judge already evaluated a submission
 */
async function findByJudgeAndSubmission(judgeId, submissionId) {
    return db.oneOrNone(
        `
        SELECT *
        FROM evaluations
        WHERE judge_id = $1
        AND submission_id = $2
        `,
        [judgeId, submissionId]
    );
}

/**
 * Create evaluation with scores
 */async function createEvaluation(data) {
    return db.one(`
        INSERT INTO evaluations (
            submission_id,
            judge_id,
            criterion_id,
            score,
            comment
        )
        VALUES ($1,$2,$3,$4,$5)
        RETURNING *
    `, [
        data.submission_id,
        data.judge_id,
        data.criterion_id,
        data.score,
        data.comment
    ]);
}


async function updateEvaluation(data) {
    return db.one(`
        UPDATE evaluations
        SET
            score = $4,
            comment = $5
        WHERE
            submission_id = $1
            AND judge_id = $2
            AND criterion_id = $3
        RETURNING *
    `, [
        data.submission_id,
        data.judge_id,
        data.criterion_id,
        data.score,
        data.comment
    ]);
}

async function getSubmissionEvaluations(submissionId) {
    return db.any(`
        SELECT
            e.id,
            e.score,
            e.comment,
            e.created_at,

            c.id AS criterion_id,
            c.code,
            c.name,
            c.max_score,

            u.id AS judge_id,
            u.username,
            u.first_name,
            u.last_name

        FROM evaluations e
        JOIN evaluation_criteria c
            ON c.id = e.criterion_id
        JOIN users u
            ON u.id = e.judge_id

        WHERE e.submission_id = $1

        ORDER BY c.id
    `,[submissionId]);
}

async function getJudgeEvaluations(submissionId, judgeId) {
    return db.any(`
        SELECT
            e.id,
            e.criterion_id,
            ec.code,
            ec.name,
            ec.max_score,
            e.score,
            e.comment,
            e.created_at
        FROM evaluations e
        JOIN evaluation_criteria ec
            ON ec.id = e.criterion_id
        WHERE
            e.submission_id = $1
            AND e.judge_id = $2
        ORDER BY ec.id
    `,[submissionId, judgeId]);
}


/**
 * Get scores of an evaluation
 */
async function getScores(submissionId) {
    return db.any(
         `
        SELECT
            e.id,
            e.judge_id,
            u.first_name,
            u.last_name,
            e.criterion_id,
            ec.code,
            ec.name,
            ec.max_score,
            e.score,
            e.comment,
            e.created_at
        FROM evaluations e
        JOIN evaluation_criteria ec
            ON ec.id = e.criterion_id
        JOIN users u
            ON u.id = e.judge_id
        WHERE e.submission_id = $1
        ORDER BY
            u.last_name,
            ec.id
        `,
        [submissionId]
    );
}

/**
 * Update comments
 */
async function updateComments(id, comments) {
    return db.one(
        `
        UPDATE evaluations
        SET
            comments = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
        `,
        [id, comments]
    );
}

/**
 * Update one criterion score
 */
async function updateScore(evaluationId, criterionId, score) {
    return db.none(
        `
        UPDATE evaluation_scores
        SET score = $3
        WHERE evaluation_id = $1
        AND criterion_id = $2
        `,
        [
            evaluationId,
            criterionId,
            score
        ]
    );
}

/**
 * Update evaluation and all scores
 */
/*
async function updateEvaluation(id, comments, scores) {

    return db.tx(async t => {

        const evaluation = await t.one(
            `
            UPDATE evaluations
            SET
                comments = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
            `,
            [id, comments]
        );

        for (const score of scores) {

            await t.none(
                `
                UPDATE evaluation_scores
                SET score = $3
                WHERE evaluation_id = $1
                AND criterion_id = $2
                `,
                [
                    id,
                    score.criterion_id,
                    score.score
                ]
            );

        }

        return evaluation;

    });

}
*/
/**
 * Get all evaluations for a submission
 */

async function findBySubmission(submissionId) {

    return db.any(
        `
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
        `,
        [submissionId]
    );

}

/**
 * Delete evaluation
 */
async function deleteEvaluation(id) {
    return db.result(
        `
        DELETE
        FROM evaluations
        WHERE id = $1
        `,
        [id]
    );
}

/**
 * 
 * Get detailed evaluation by id, including scores
 */
async function findDetailedById(id) {

    const evaluation = await findById(id);

    if (!evaluation) {
        return null;
    }

    evaluation.scores = await getScores(id);

    return evaluation;

}

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

async function findEvaluation(submissionId, judgeId, criterionId) {
    return db.oneOrNone(`
        SELECT *
        FROM evaluations
        WHERE submission_id = $1
          AND judge_id = $2
          AND criterion_id = $3
    `, [submissionId, judgeId, criterionId]);
}

module.exports = {
    findAll,
    findById,
    findByJudgeAndSubmission,
    findEvaluation,
    createEvaluation,
    getSubmissionEvaluations,
    getJudgeEvaluations,
    getScores,
    updateComments,
    updateScore,
    deleteEvaluation,
    findBySubmission,
    updateEvaluation,
    findDetailedById,
    getCriteria,
    getCriterionById,
};