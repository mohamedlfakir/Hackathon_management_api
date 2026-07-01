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

module.exports = {
    create,
    findByEmail,
    findById,
};