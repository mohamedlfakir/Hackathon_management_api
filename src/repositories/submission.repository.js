const db = require("../config/database");

/**
 * Get all submissions with derived status, search, filters, sorting, and pagination
 */
async function findAll(params = {}) {
  const {
    page = 1,
    limit = 10,
    search,
    hackathon_id,
    status = "ALL", // 'ALL' | 'UNEVALUATED' | 'IN_PROGRESS' | 'COMPLETED'
    sort_by = "submitted_at",
    sort_order = "desc",
  } = params;

  const conditions = [];
  const queryParams = [];
  let paramIdx = 1;

  // 1. Search filter
  if (search && search.trim() !== "") {
    conditions.push(
      `(s.title ILIKE $${paramIdx} OR t.name ILIKE $${paramIdx} OR u.first_name ILIKE $${paramIdx} OR u.last_name ILIKE $${paramIdx})`
    );
    queryParams.push(`%${search.trim()}%`);
    paramIdx++;
  }

  // 2. Hackathon filter
  if (hackathon_id) {
    conditions.push(`COALESCE(s.hackathon_id, t.hackathon_id) = $${paramIdx}`);
    queryParams.push(Number(hackathon_id));
    paramIdx++;
  }

  // SQL subqueries for evaluation counts & judge counts
  // Note: Adjust 'hackathon_judges' if your junction table is named differently
  const evalsCountSubquery = `(SELECT COUNT(DISTINCT e.id) FROM evaluations e WHERE e.submission_id = s.id)`;
  const totalJudgesSubquery = `(SELECT COUNT(DISTINCT hj.judge_id) FROM hackathon_judges hj WHERE hj.hackathon_id = COALESCE(s.hackathon_id, t.hackathon_id))`;

  // 3. Status filter based on derived evaluation completion
  if (status === "UNEVALUATED") {
    conditions.push(`${evalsCountSubquery} = 0`);
  } else if (status === "IN_PROGRESS") {
    conditions.push(
      `${evalsCountSubquery} > 0 AND ${evalsCountSubquery} < ${totalJudgesSubquery}`
    );
  } else if (status === "COMPLETED") {
    conditions.push(
      `${evalsCountSubquery} >= ${totalJudgesSubquery} AND ${evalsCountSubquery} > 0`
    );
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // 4. Allowed sort columns whitelist
  const allowedSortColumns = {
    title: "s.title",
    team_name: "t.name",
    hackathon: "h.title",
    submitted_at: "s.submitted_at",
    score: "score",
    evaluation_status: "evaluation_status",
  };

  const sortColumn = allowedSortColumns[sort_by] || "s.submitted_at";
  const orderDirection = String(sort_order).toLowerCase() === "asc" ? "ASC" : "DESC";

  // 5. Pagination offset
  const numericLimit = Number(limit);
  const numericPage = Number(page);
  const offset = (numericPage - 1) * numericLimit;

  queryParams.push(numericLimit, offset);
  const limitParam = `$${paramIdx++}`;
  const offsetParam = `$${paramIdx++}`;

  const query = `
    SELECT
      s.*,
      t.name AS team_name,
      h.id AS hackathon_id,
      h.title AS hackathon_title,
      u.username,
      u.first_name,
      u.last_name,
      u.email,

      -- Derived evaluation status logic
      CASE
        WHEN ${evalsCountSubquery} = 0 THEN 'UNEVALUATED'
        WHEN ${evalsCountSubquery} >= ${totalJudgesSubquery} AND ${totalJudgesSubquery} > 0 THEN 'COMPLETED'
        ELSE 'IN_PROGRESS'
      END AS evaluation_status,

      -- Boolean flag for quick frontend checks
      (${evalsCountSubquery} > 0) AS is_evaluated,

      -- Average score computed from evaluations_scores
      (
        SELECT ROUND(AVG(es.score))
        FROM evaluations e
        JOIN evaluations_scores es ON es.evaluation_id = e.id
        WHERE e.submission_id = s.id
      ) AS score,

      -- Total matching count window function for pagination
      COUNT(*) OVER() AS total_count

    FROM submissions s

    LEFT JOIN teams t
      ON t.id = s.team_id

    LEFT JOIN users u
      ON u.id = s.user_id

    LEFT JOIN hackathons h
      ON h.id = COALESCE(s.hackathon_id, t.hackathon_id)

    ${whereClause}

    ORDER BY ${sortColumn} ${orderDirection}
    LIMIT ${limitParam} OFFSET ${offsetParam}
  `;

  const rows = await db.any(query, queryParams);

  const total = rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;
  const data = rows.map(({ total_count, ...submission }) => submission);

  return {
    data,
    total,
    page: numericPage,
    limit: numericLimit,
  };
}
/*
async function findAll() {
    return db.any(
        `
        SELECT
            s.*,
            t.name AS team_name,
            h.id AS hackathon_id,
            h.title AS hackathon_title,
            u.username,
            u.first_name,
            u.last_name,
            u.email
        FROM submissions s

        LEFT JOIN teams t
            ON t.id = s.team_id

        LEFT JOIN users u
            ON u.id = s.user_id

        JOIN hackathons h
            ON h.id = t.hackathon_id
        ORDER BY s.submitted_at DESC
        `
    );
}*/

/**
 * Get submission by id
 */
async function findById(id) {
    return db.oneOrNone(
        `
       SELECT
            s.*,

            t.name AS team_name,

            u.username,
            u.first_name,
            u.last_name,
            u.email,

            h.id AS hackathon_id,
            h.title AS hackathon_title

        FROM submissions s

        LEFT JOIN teams t
            ON t.id = s.team_id

        LEFT JOIN users u
            ON u.id = s.user_id

        JOIN hackathons h
            ON h.id = s.hackathon_id

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
 * Get submission by user
 */

async function findByUser(hackathonId, userId) {
    return db.oneOrNone(
        `
        SELECT *
        FROM submissions
        WHERE hackathon_id = $1
          AND user_id = $2
        `,
        [hackathonId, userId]
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
            user_id,
            title,
            description,
            github_url,
            figma_url,
            presentation_path,
            hackathon_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        `,
        [
            data.team_id,
            data.user_id,
            data.title,
            data.description,
            data.github_url,
            data.figma_url,
            data.presentation_path,
            data.hackathon_id
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

/**
 * Get submission ranking for a hackathon
 */
async function getSubmissionRanking(hackathonId) {
    return db.any(`
        SELECT
            s.id,
            s.title,

            s.team_id,
            t.name AS team_name,

            s.user_id,
            u.first_name,
            u.last_name,

            COUNT(DISTINCT e.judge_id) AS judges_count,

            COALESCE(SUM(es.score), 0) AS total_score,

            COALESCE(AVG(judge_scores.total), 0) AS average_score

        FROM submissions s

        LEFT JOIN teams t
            ON t.id = s.team_id

        LEFT JOIN users u
            ON u.id = s.user_id

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
        ) AS judge_scores
            ON judge_scores.id = e.id

        WHERE s.hackathon_id = $1

        GROUP BY
            s.id,
            s.title,
            s.team_id,
            t.name,
            s.user_id,
            u.first_name,
            u.last_name

        ORDER BY
            average_score DESC,
            total_score DESC,
            s.title
    `, [hackathonId]);
}

/**
 * Get top 3 submissions of a hackathon
 */
async function getTopSubmissions(hackathonId) {
    return db.any(`
        SELECT
            s.id,
            s.title,

            s.team_id,
            t.name AS team_name,

            s.user_id,
            u.first_name,
            u.last_name,

            COUNT(DISTINCT e.judge_id) AS judges_count,

            COALESCE(SUM(es.score), 0) AS total_score,

            COALESCE(AVG(judge_scores.total), 0) AS average_score

        FROM submissions s

        LEFT JOIN teams t
            ON t.id = s.team_id

        LEFT JOIN users u
            ON u.id = s.user_id

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
        ) AS judge_scores
            ON judge_scores.id = e.id

        WHERE s.hackathon_id = $1

        GROUP BY
            s.id,
            s.title,
            s.team_id,
            t.name,
            s.user_id,
            u.first_name,
            u.last_name

        ORDER BY
            average_score DESC,
            total_score DESC,
            s.title

        LIMIT 3
    `, [hackathonId]);
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
    updateFigmaUrl,
    findByUser,
    getSubmissionRanking,
    getTopSubmissions
};
