const dashboardRepository = require("../repositories/dashboard.repository");

const AppError = require("../utils/AppError");

/**
 * Get dashboard statistics
 */
async function getDashboardStatistics() {
    return await dashboardRepository.getDashboardStatistics();
}

module.exports = {
    getDashboardStatistics
};