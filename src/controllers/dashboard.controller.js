const dashboardService = require("../services/dashboard.service");

const asyncHandler = require("../utils/asyncHandler");


/**
 * Get dashboard statistics
 */
async function getDashboardStatistics(req, res, next) {
    try {
        const statistics =
            await dashboardService.getDashboardStatistics();

        res.status(200).json(statistics);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getDashboardStatistics
};