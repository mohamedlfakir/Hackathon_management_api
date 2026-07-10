const express = require("express");

const router = express.Router();

const evaluationController = require("../controllers/evaluation.controller");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize.middleware");
const validate = require("../middleware/validate.middleware");

const {
    evaluationIdValidator,
    submissionIdValidator,
    createEvaluationValidator,
    updateEvaluationValidator
} = require("../validators/evaluation.validator");

/*
|--------------------------------------------------------------------------
| Judge Routes
|--------------------------------------------------------------------------
*/

router.get(
    "/",
    authenticate,
    authorize("JUDGE", "ADMIN"),
    evaluationController.getAllEvaluations
);

router.get(
    "/criteria",
    authenticate,
    authorize("JUDGE", "ADMIN"),
    evaluationController.getCriteria
);

router.get(
    "/:id",
    authenticate,
    authorize("JUDGE", "ADMIN"),
    evaluationIdValidator,
    validate,
    evaluationController.getEvaluationById
);

router.get(
    "/submissions/:submissionId",
    authenticate,
    authorize( "ADMIN", "ORGANIZER", "JUDGE"),
    submissionIdValidator,
    validate,
    evaluationController.getSubmissionEvaluations
);

router.post(
    "/",
    authenticate,
    authorize("JUDGE", "ADMIN"),
    createEvaluationValidator,
    validate,
    evaluationController.createEvaluation
);

router.post(
    "/:submissionId",
    authenticate,
    authorize("JUDGE", "ADMIN"),
    createEvaluationValidator,
    validate,
    evaluationController.evaluateSubmission
);

router.get(
    "/submissions/:submissionId/my-evaluation",
    authenticate,
    authorize("JUDGE"),
    evaluationController.getMyEvaluation
);

router.put(
    "/:id",
    authenticate,
    authorize("JUDGE", "ADMIN"),
    evaluationIdValidator,
    updateEvaluationValidator,
    validate,
    evaluationController.updateEvaluation
);

router.delete(
    "/:id",
    authenticate,
    authorize("JUDGE", "ADMIN"),
    evaluationIdValidator,
    validate,
    evaluationController.deleteEvaluation
);



module.exports = router;