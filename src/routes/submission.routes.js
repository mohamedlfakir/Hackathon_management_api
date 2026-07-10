const express = require("express");

const router = express.Router();

const submissionController = require("../controllers/submission.controller");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize.middleware");
const validate = require("../middleware/validate.middleware");

const {
    presentationUpload
} = require("../config/uploads");


const {
    submissionIdValidator,
    createSubmissionValidator,
    updateSubmissionValidator,
    updateGithubValidator,
    updateFigmaValidator
} = require("../validators/submission.validator");

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/


router.get(
    "/",
    authenticate,
    authorize("ADMIN", "ORGANIZER"),
    submissionController.getAllSubmissions
);

router.get(
    "/:id",
    authenticate,
    authorize("ADMIN", "ORGANIZER","JUDGE"),
    submissionIdValidator,
    validate,
    submissionController.getSubmissionById
);

/*
|--------------------------------------------------------------------------
| Participant Routes
|--------------------------------------------------------------------------
*/

// routes/submission.routes.js

router.get(
    "/hackathons/:hackathonId/my-submission",
    authenticate,
    authorize("PARTICIPANT"),
    submissionController.getMySubmission
);

router.post(
    "/",
    authenticate,
    authorize("PARTICIPANT"),
    createSubmissionValidator,
    validate,
    submissionController.createSubmission
);

router.put(
    "/:id",
    authenticate,
    authorize("PARTICIPANT"),
    submissionIdValidator,
    updateSubmissionValidator,
    validate,
    submissionController.updateSubmission
);

router.delete(
    "/:id",
    authenticate,
    authorize("PARTICIPANT"),
    submissionIdValidator,
    validate,
    submissionController.deleteSubmission
);

/*
|--------------------------------------------------------------------------
| Project Resources
|--------------------------------------------------------------------------
*/

router.put(
    "/:id/github",
    authenticate,
    authorize("PARTICIPANT"),
    submissionIdValidator,
    updateGithubValidator,
    validate,
    submissionController.updateGithubUrl
);

router.put(
    "/:id/figma",
    authenticate,
    authorize("PARTICIPANT"),
    submissionIdValidator,
    updateFigmaValidator,
    validate,
    submissionController.updateFigmaUrl
);

router.put(
    "/:id/presentation",
    authenticate,
    authorize("PARTICIPANT"),
    presentationUpload.single("presentation"),
    submissionIdValidator,
    validate,
    submissionController.updatePresentation
);

module.exports = router;