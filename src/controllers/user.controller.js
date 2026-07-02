const userService = require("../services/user.service");
const asyncHandler = require("../utils/asyncHandler");

/**
 * GET /api/users
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
    const users = await userService.getAllUsers();

    res.status(200).json({
        success: true,
        users
    });
});

/**
 * GET /api/users/:id
 */
exports.getUserById = asyncHandler(async (req, res) => {
    const user = await userService.getById(req.params.id);

    res.status(200).json({
        success: true,
        user
    });
});

/**
 * GET /api/users/me
 */
exports.getMe = asyncHandler(async (req, res) => {
    const user = await userService.getById(req.user.id);

    res.status(200).json({
        success: true,
        user
    });
});

/**
 * PUT /api/users/me
 */
exports.updateProfile = asyncHandler(async (req, res) => {
    const user = await userService.updateProfile(req.user.id, req.body);

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user
    });
});

/**
 * PUT /api/users/me/password
 */
exports.changePassword = asyncHandler(async (req, res) => {
    const result = await userService.changePassword(req.user.id, req.body);

    res.status(200).json({
        success: true,
        message: result.message
    });
});

/**
 * PUT /api/users/me/avatar
 */
exports.updateAvatar = asyncHandler(async (req, res) => {

    if (!req.file) {
        throw new AppError("No image uploaded", 400);
    }

    const avatarPath = `uploads/avatars/${req.file.filename}`;

    const user = await userService.updateAvatar(
        req.user.id,
        avatarPath
    );

    res.json({
        success: true,
        message: "Avatar updated successfully",
        user
    });

});

/**
 * PUT /api/users/:id/role
 */
exports.updateRole = asyncHandler(async (req, res) => {
    const user = await userService.updateRole(
        req.params.id,
        req.body.role
    );

    res.status(200).json({
        success: true,
        message: "Role updated successfully",
        user
    });
});

/**
 * DELETE /api/users/:id
 */
exports.deleteUser = asyncHandler(async (req, res) => {
    const result = await userService.deleteUser(req.params.id);

    res.status(200).json({
        success: true,
        message: result.message
    });
});