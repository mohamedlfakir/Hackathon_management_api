const express = require("express");

const router = express.Router();

const evaluationController = require("../controllers/evaluation.controller");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize.middleware");
const validate = require("../middleware/validate.middleware");

const {
    judgeIdValidator,
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


/*
|--------------------------------------------------------------------------
| Authenticated Judge Routes
|--------------------------------------------------------------------------
*/

// My pending submissions
router.get(
    "/my/pending-submissions",
    authenticate,
    authorize("JUDGE"),
    evaluationController.getMyPendingSubmissions
);

// My pending submissions count
router.get(
    "/my/pending-submissions/count",
    authenticate,
    authorize("JUDGE"),
    evaluationController.getMyPendingSubmissionsCount
);

// My evaluated submissions
router.get(
    "/my/evaluated-submissions",
    authenticate,
    authorize("JUDGE"),
    evaluationController.getMyEvaluatedSubmissions
);

// My evaluated submissions count
router.get(
    "/my/evaluated-submissions/count",
    authenticate,
    authorize("JUDGE"),
    evaluationController.getMyEvaluatedSubmissionsCount
);



/*
|--------------------------------------------------------------------------
| Judge Evaluation Routes
|--------------------------------------------------------------------------
*/

// Pending submissions (Admin)
/*
router.get(
    "/judges/:judgeId/pending-submissions",
    authenticate,
    authorize("ADMIN"),
    judgeIdValidator,
    validate,
    evaluationController.getPendingSubmissions
);


// Evaluated submissions (Admin)
router.get(
    "/judges/:judgeId/evaluated-submissions",
    authenticate,
    authorize("ADMIN"),
    judgeIdValidator,
    validate,
    evaluationController.getEvaluatedSubmissions
);*/





module.exports = router;