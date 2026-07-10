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
    authorize("ADMIN"),
    hackathonIdValidator,
    validate,
    hackathonController.deleteHackathon
);

router.post(
    "/:id/assign-user",
    authenticate,
    authorize("ADMIN", "ORGANIZER"), 
    hackathonIdValidator,
    // Vous pouvez ajouter ici un validateur pour req.body.userId si vous en avez un
    validate,
    hackathonController.assignUserByAdmin
);


router.get(
    "/:id/solo-participants",
    authenticate,
    authorize("ADMIN", "ORGANIZER"),
    hackathonIdValidator,
    validate,
    hackathonController.getSoloParticipants
);

// Assign a judge
router.post(
    "/:id/judges",
    authenticate,
    authorize("ADMIN", "ORGANIZER"),
    hackathonIdValidator,
    assignJudgeValidator,
    validate,
    hackathonController.assignJudge
);

// Remove a judge
router.delete(
    "/:id/judges/:judgeId",
    authenticate,
    authorize("ADMIN", "ORGANIZER"),
    hackathonIdValidator,
    judgeIdValidator,
    validate,
    hackathonController.removeJudge
);


router.get(
    "/:id/is-participant",
    authenticate,   
    authorize("PARTICIPANT"),
    hackathonIdValidator,
    validate,
    hackathonController.isParticipant
);

// List judges for a hackathon
router.get(
    "/:id/judges",
    authenticate,
    authorize("ADMIN", "ORGANIZER","JUDGE"),
    hackathonIdValidator,
    validate,
    hackathonController.getHackathonJudges
);

// List hackathons assigned to a judge
router.get(
    "/judges/:judgeId/hackathons",
    authenticate,
    authorize("ADMIN", "ORGANIZER","JUDGE"),
    judgeIdValidator,
    validate,
    hackathonController.getJudgeHackathons
);

router.get("/:id/teams",
    authenticate,
    authorize("ADMIN", "ORGANIZER"), 
    hackathonController.getHackathonTeams);

router.post("/:id/teams",
    authenticate,
    authorize("ADMIN", "ORGANIZER"),
     hackathonController.registerTeam);

router.delete("/:id/teams/:teamId",
     authenticate,
    authorize("ADMIN", "ORGANIZER"), 
    hackathonController.unregisterTeam);

router.get("/:id/submissions", 
    authenticate,
    authorize("ADMIN", "ORGANIZER","JUDGE"), 
    hackathonController.getHackathonSubmissions);    

router.get(
    "/:id/participants",
    authenticate,
    authorize("ADMIN", "ORGANIZER","JUDGE"),
    hackathonController.getHackathonParticipants
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


module.exports = router;


