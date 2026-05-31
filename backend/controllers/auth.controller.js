const User = require("../models/User");
const { createToken } = require("../utils/auth");

function sanitizeUser(user) {
    return {
        email: user.email,
        id: user.id,
        name: user.name,
        role: user.role,
    };
}

async function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email y contraseña son obligatorios." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
        return res.status(401).json({ message: "Credenciales incorrectas." });
    }

    if (!user.checkPassword(password)) {
        return res.status(401).json({ message: "Credenciales incorrectas." });
    }

    res.json({
        token: createToken(user),
        user: sanitizeUser(user),
    });
}

async function register(req, res) {
    const { email, name, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Nombre, email y contraseña son obligatorios." });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (existingUser) {
        return res.status(409).json({ message: "Ya existe una cuenta con ese email." });
    }

    const user = await User.create({
        email,
        name,
        password: User.password(password),
        role: "admin",
    });

    res.status(201).json({
        token: createToken(user),
        user: sanitizeUser(user),
    });
}

async function getSession(req, res) {
    res.json({ user: sanitizeUser(req.user) });
}

module.exports = {
    getSession,
    login,
    register,
};
