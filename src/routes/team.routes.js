const express = require("express");

const router = express.Router();

const teamController = require("../controllers/team.controller");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize.middleware");
const validate = require("../middleware/validate.middleware");

const {
    avatarUpload
} = require("../config/uploads");

const {
    teamIdValidator,
    createTeamValidator,
    updateTeamValidator
} = require("../validators/team.validator");

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

router.get(
    "/",
    teamController.getAllTeams
);

router.get(
    "/:id",
    teamIdValidator,
    validate,
    teamController.getTeamById
);

/*
|--------------------------------------------------------------------------
| Participant Routes
|--------------------------------------------------------------------------
*/

router.post(
    "/",
    authenticate,
    authorize("PARTICIPANT"),
    createTeamValidator,
    validate,
    teamController.createTeam
);

router.put(
    "/:id",
    authenticate,
    authorize("PARTICIPANT"),
    teamIdValidator,
    updateTeamValidator,
    validate,
    teamController.updateTeam
);

router.delete(
    "/:id",
    authenticate,
    authorize("PARTICIPANT"),
    teamIdValidator,
    validate,
    teamController.deleteTeam
);

router.post(
    "/:id/add-member",
    authenticate,
    authorize("ADMIN", "ORGANIZER", "PARTICIPANT"),
    teamIdValidator,
    validate,
    teamController.joinTeam
);

router.delete(
    "/:id/members/:userId",
    authenticate,
    authorize("ADMIN", "ORGANIZER", "PARTICIPANT"),
    teamIdValidator,
    validate,
    teamController.removeMember
);

router.delete(
    "/:id/leave",
    authenticate,
    authorize("PARTICIPANT","ADMIN", "ORGANIZER",),
    teamIdValidator,
    validate,
    teamController.leaveTeam
);

router.get(
    "/:id/members",
    authenticate,
    teamIdValidator,
    validate,
    teamController.getMembers
);

router.put(
    "/:id/avatar",
    authenticate,
    authorize("PARTICIPANT"),
    avatarUpload.single("avatar"),
    teamIdValidator,
    validate,
    teamController.updateAvatar
);

router.get(
    "/hackathons/:hackathonId/my-team",
    authenticate,
    authorize("PARTICIPANT"),
    teamController.getUserTeam
);

module.exports = router;