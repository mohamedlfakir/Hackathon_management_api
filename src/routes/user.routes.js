const express = require("express");

const router = express.Router();

const userController = require("../controllers/user.controller");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize.middleware");
const validate = require("../middleware/validate.middleware");
const {
    avatarUpload
} = require("../config/uploads");

const {
    updateProfileValidator,
    changePasswordValidator,
    updateRoleValidator,
} = require("../validators/user.validator");

/*
|--------------------------------------------------------------------------
| Current authenticated user
|--------------------------------------------------------------------------
*/

router.get(
    "/me",
    authenticate,
    userController.getMe
);

router.put(
    "/me",
    authenticate,
    updateProfileValidator,
    validate,
    userController.updateProfile
);

router.put(
    "/me/password",
    authenticate,
    changePasswordValidator,
    validate,
    userController.changePassword
);

router.put(
    "/me/avatar",
    authenticate,
    avatarUpload.single("avatar"),
    userController.updateAvatar
);

/*
|--------------------------------------------------------------------------
| Admin routes
|--------------------------------------------------------------------------
*/

router.get(
    "/",
    authenticate,
    authorize("ADMIN"),
    userController.getAllUsers
);

router.get(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    userController.getUserById
);
    
router.put(
    "/:id/role",
    authenticate,
    authorize("ADMIN"),
    updateRoleValidator,
    validate,
    userController.updateRole
);

router.delete(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    userController.deleteUser
);

module.exports = router;