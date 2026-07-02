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
 */
async function create(evaluation, scores) {

    return db.tx(async t => {

        const createdEvaluation = await t.one(
            `
            INSERT INTO evaluations (
                submission_id,
                judge_id,
                comments
            )
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [
                evaluation.submission_id,
                evaluation.judge_id,
                evaluation.comments
            ]
        );

        for (const score of scores) {

            await t.none(
                `
                INSERT INTO evaluation_scores (
                    evaluation_id,
                    criterion_id,
                    score
                )
                VALUES ($1, $2, $3)
                `,
                [
                    createdEvaluation.id,
                    score.criterion_id,
                    score.score
                ]
            );

        }

        return createdEvaluation;

    });

}

/**
 * Get scores of an evaluation
 */
async function getScores(evaluationId) {
    return db.any(
        `
        SELECT
            es.criterion_id,
            ec.name,
            ec.max_score,
            es.score
        FROM evaluation_scores es
        JOIN evaluation_criteria ec
            ON ec.id = es.criterion_id
        WHERE es.evaluation_id = $1
        ORDER BY ec.id
        `,
        [evaluationId]
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


module.exports = {
    findAll,
    findById,
    findByJudgeAndSubmission,
    create,
    getScores,
    updateComments,
    updateScore,
    deleteEvaluation,
    findBySubmission,
    updateEvaluation,
    findDetailedById,
};