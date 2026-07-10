const db = require("../config/database");

/**
 * Get dashboard statistics
 */
async function getDashboardStatistics() {
    return db.one(`
        SELECT
            (SELECT COUNT(*) FROM users) AS total_users,

            (SELECT COUNT(*) FROM hackathons) AS total_hackathons,

            (SELECT COUNT(*) FROM submissions) AS total_submissions,

            (SELECT COUNT(*) FROM teams) AS total_teams,

            (SELECT COUNT(*) FROM users WHERE role = 'PARTICIPANT') AS total_participants,

            (SELECT COUNT(*) FROM users WHERE role = 'ORGANIZER') AS total_organizers,

            (SELECT COUNT(*) FROM users WHERE role = 'JUDGE') AS total_judges,

            (SELECT COUNT(*) FROM users WHERE role = 'ADMIN') AS total_admins,

            (SELECT COUNT(*) FROM hackathons WHERE status = 'UPCOMING') AS upcoming_hackathons,

            (SELECT COUNT(*) FROM hackathons WHERE status IN ('OPEN','CLOSED')) AS active_hackathons,

            (SELECT COUNT(*) FROM hackathons WHERE status = 'FINISHED') AS finished_hackathons
    `);
}


module.exports = {
    getDashboardStatistics
};