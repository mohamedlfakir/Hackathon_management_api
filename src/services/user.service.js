const bcrypt = require("bcrypt");

const userRepository = require("../repositories/user.repository");
const AppError = require("../utils/AppError");

/**
 * Get all users
 */
async function getAllUsers() {
    return await userRepository.findAll();
}

/**
 * Get user by id
 */
async function getById(id) {
    const user = await userRepository.findById(id);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    delete user.password_hash;

    return user;
}

/**
 * Update profile
 */
async function updateProfile(id, data) {
    const user = await userRepository.findById(id);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    if (data.username && data.username !== user.username) {
        const existing = await userRepository.findByUsername(data.username);

        if (existing) {
            throw new AppError("Username already exists", 409);
        }
    }

    return await userRepository.updateProfile(id, {
        username: data.username ?? user.username,
        first_name: data.first_name ?? user.first_name,
        last_name: data.last_name ?? user.last_name,
        bio: data.bio ?? user.bio
    });
}

/**
 * Change password
 */
async function changePassword(id, data) {
    const user = await userRepository.findById(id);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const validPassword = await bcrypt.compare(
        data.currentPassword,
        user.password_hash
    );

    if (!validPassword) {
        throw new AppError("Current password is incorrect", 400);
    }

    const hash = await bcrypt.hash(data.newPassword, 10);

    await userRepository.updatePassword(id, hash);

    return {
        message: "Password updated successfully"
    };
}

/**
 * Update avatar
 */
async function updateAvatar(id, avatarPath) {
    const user = await userRepository.findById(id);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return await userRepository.updateAvatar(id, avatarPath);
}

/**
 * Update role
 */
async function updateRole(id, role) {
    const user = await userRepository.findById(id);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return await userRepository.updateRole(id, role);
}

/**
 * Delete user
 */
async function deleteUser(id) {
    const user = await userRepository.findById(id);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    await userRepository.deleteUser(id);

    return {
        message: "User deleted successfully"
    };
}

module.exports = {
    getAllUsers,
    getById,
    updateProfile,
    changePassword,
    updateAvatar,
    updateRole,
    deleteUser
};