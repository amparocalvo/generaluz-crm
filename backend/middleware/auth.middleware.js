const User = require("../models/User");
const { verifyToken } = require("../utils/auth");

async function requireAuth(req, res, next) {
    const authorization = req.headers.authorization || "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    const payload = verifyToken(token);

    if (!payload) {
        return res.status(401).json({ message: "Debes iniciar sesión." });
    }

    const user = await User.findById(payload.userId);

    if (!user) {
        return res.status(401).json({ message: "Sesión no válida." });
    }

    req.user = user;
    next();
}

module.exports = requireAuth;
