const authService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");

exports.register = asyncHandler(async (req, res) => {
    const user = await authService.register(req.body);

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: "PARTICIPANT"
        }
    });
});

exports.login = asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);

    res.status(200).json({
        success: true,
        message: "Login successful",
        token: result.token,
        user: result.user
    });
});

exports.me = asyncHandler(async (req, res) => {
    const user = await authService.getCurrentUser(req.user.id);

    res.status(200).json({
        success: true,
        user
    });
});