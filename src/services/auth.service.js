const bcrypt = require("bcrypt");

const repository = require("../repositories/user.repository");
const jwt = require("../utils/jwt");

const AppError = require("../utils/AppError");

async function register(data) {

    const exists = await repository.findByEmail(data.email);

    if (exists)
        throw new AppError("Email already exists", 409);

    const hash = await bcrypt.hash(data.password, 10);

    const user = await repository.create({
        username: data.username,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password_hash: hash,
        role: "participant",
    });

    return user;
}

async function login(data) {

    const user = await repository.findByEmail(data.email);

    if (!user)
        throw new AppError("Invalid credentials", 401);

    const ok = await bcrypt.compare(
        data.password,
        user.password_hash
    );

    if (!ok)
        throw new AppError("Invalid credentials", 401);

    const token = jwt.generateToken(user);

    return {
        token,
        user: {
            id: user.id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
        },
    };
}

async function getCurrentUser(id) {
    const user = await repository.findById(id);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
    };
}

module.exports = {
    register,
    login,
    getCurrentUser
};