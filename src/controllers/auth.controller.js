const service = require("../services/auth.service");

async function register(req, res) {

    try {

        const user = await service.register(req.body);

        res.status(201).json(user);

    } catch (err) {

        res.status(400).json({
            message: err.message,
        });

    }

}

async function login(req, res) {

    try {

        const result = await service.login(req.body);

        res.json(result);

    } catch (err) {

        res.status(401).json({
            message: err.message,
        });

    }

}

module.exports = {
    register,
    login,
};