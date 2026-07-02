const db = require("../config/database");

async function findByEmail(email) {
    return db.oneOrNone(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );
}

async function findById(id) {
    return db.oneOrNone(
        "SELECT * FROM users WHERE id = $1",
        [id]
    );
}

async function create(user) {
    return db.one(
        `
        INSERT INTO users
        (
            username,
            first_name,
            last_name,
            email,
            password_hash,
            role
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6
        )
        RETURNING *
        `,
        [
            user.username,
            user.first_name,
            user.last_name,
            user.email,
            user.password_hash,
            user.role,
        ]
    );
}


/**
 * Get all users
 */
async function findAll() {
    return db.any(
        `
        SELECT
            id,
            username,
            first_name,
            last_name,
            email,
            role,
            bio,
            avatar_path,
            created_at,
            updated_at
        FROM users
        ORDER BY created_at DESC
        `
    );
}

/**
 * Get user by id
 */
async function findById(id) {
    return db.oneOrNone(
        `
        SELECT
            id,
            username,
            first_name,
            last_name,
            email,
            password_hash,
            role,
            bio,
            avatar_path,
            created_at,
            updated_at
        FROM users
        WHERE id = $1
        `,
        [id]
    );
}

/**
 * Get user by email
 */
async function findByEmail(email) {
    return db.oneOrNone(
        `
        SELECT *
        FROM users
        WHERE email = $1
        `,
        [email]
    );
}

/**
 * Get user by username
 */
async function findByUsername(username) {
    return db.oneOrNone(
        `
        SELECT *
        FROM users
        WHERE username = $1
        `,
        [username]
    );
}

/**
 * Update profile
 */
async function updateProfile(id, data) {
    return db.one(
        `
        UPDATE users
        SET
            username = $2,
            first_name = $3,
            last_name = $4,
            bio = $5,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING
            id,
            username,
            first_name,
            last_name,
            email,
            role,
            bio,
            avatar_path,
            created_at,
            updated_at
        `,
        [
            id,
            data.username,
            data.first_name,
            data.last_name,
            data.bio
        ]
    );
}

/**
 * Update password
 */
async function updatePassword(id, passwordHash) {
    return db.none(
        `
        UPDATE users
        SET
            password_hash = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        `,
        [id, passwordHash]
    );
}

/**
 * Update avatar
 */
async function updateAvatar(id, avatarPath) {
    return db.one(
        `
        UPDATE users
        SET
            avatar_path = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING
            id,
            username,
            avatar_path
        `,
        [id, avatarPath]
    );
}

/**
 * Update role
 */
async function updateRole(id, role) {
    return db.one(
        `
        UPDATE users
        SET
            role = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING
            id,
            username,
            role
        `,
        [id, role]
    );
}

/**
 * Delete user
 */
async function deleteUser(id) {
    return db.result(
        `
        DELETE FROM users
        WHERE id = $1
        `,
        [id]
    );
}


module.exports = {
    create,
    findAll,
    findById,
    findByEmail,
    findByUsername,
    updateProfile,
    updatePassword,
    updateAvatar,
    updateRole,
    deleteUser
};