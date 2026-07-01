const jwt = require("../utils/jwt");

function authenticate(req, res, next) {

    const header = req.headers.authorization;

    if (!header)
        return res.status(401).json({
            message: "Missing token",
        });

    const token = header.split(" ")[1];

    try {

        req.user = jwt.verifyToken(token);

        next();

    } catch {

        res.status(401).json({
            message: "Invalid token",
        });

    }

}

module.exports = authenticate;