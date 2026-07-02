const express = require("express");

const router = express.Router();

const hackathonController = require("../controllers/hackathon.controller");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize.middleware");
const validate = require("../middleware/validate.middleware");

const {
    hackathonIdValidator,
    createHackathonValidator,
    updateHackathonValidator,
    assignJudgeValidator,
    judgeIdValidator
} = require("../validators/hackathon.validator");

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

router.get(
    "/",
    hackathonController.getAllHackathons
);

router.get(
    "/:id",
    hackathonIdValidator,
    validate,
    hackathonController.getHackathonById
);

/*
|--------------------------------------------------------------------------
| Organizer / Admin Routes
|--------------------------------------------------------------------------
*/

router.post(
    "/",
    authenticate,
    authorize("ADMIN", "ORGANIZER"),
    createHackathonValidator,
    validate,
    hackathonController.createHackathon
);

router.put(
    "/:id",
    authenticate,
    authorize("ADMIN", "ORGANIZER"),
    hackathonIdValidator,
    updateHackathonValidator,
    validate,
    hackathonController.updateHackathon
);

router.delete(
    "/:id",
    authenticate,
    authorize("ADMIN", "ORGANIZER"),
    hackathonIdValidator,
    validate,
    hackathonController.deleteHackathon
);

/*
|--------------------------------------------------------------------------
| Participant Routes
|--------------------------------------------------------------------------
*/

router.post(
    "/:id/register",
    authenticate,
    authorize("PARTICIPANT"),
    hackathonIdValidator,
    validate,
    hackathonController.registerParticipant
);

router.delete(
    "/:id/register",
    authenticate,
    authorize("PARTICIPANT"),
    hackathonIdValidator,
    validate,
    hackathonController.unregisterParticipant
);

router.get(
    "/:id/participants",
    authenticate,
    authorize("ADMIN", "ORGANIZER"),
    hackathonIdValidator,
    validate,
    hackathonController.getParticipants
);

// Assign a judge
router.post(
    "/:id/judges",
    authenticate,
    authorize("ADMIN"),
    hackathonIdValidator,
    assignJudgeValidator,
    validate,
    hackathonController.assignJudge
);

// Remove a judge
router.delete(
    "/:id/judges/:judgeId",
    authenticate,
    authorize("ADMIN"),
    hackathonIdValidator,
    judgeIdValidator,
    validate,
    hackathonController.removeJudge
);

// List judges for a hackathon
router.get(
    "/:id/judges",
    authenticate,
    authorize("ADMIN"),
    hackathonIdValidator,
    validate,
    hackathonController.getHackathonJudges
);

// List hackathons assigned to a judge
router.get(
    "/judges/:judgeId/hackathons",
    authenticate,
    authorize("ADMIN"),
    judgeIdValidator,
    validate,
    hackathonController.getJudgeHackathons
);

module.exports = router;