const Client = require("../models/Client");

function isValidEmail(email) {
    return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizePhone(phone) {
    return String(phone || "").replace(/\s/g, "");
}

function validateClient(body) {
    const { name, phone, email, status } = body;
    const validStatuses = ["Nuevo", "Contactado", "Presupuesto", "Instalación"];

    if (!name || !phone || !status) {
        return "Nombre, teléfono y estado son obligatorios.";
    }

    if (name.trim().length < 3) {
        return "El nombre debe tener al menos 3 caracteres.";
    }

    if (!/^[0-9+]{9,15}$/.test(normalizePhone(phone))) {
        return "Introduce un teléfono válido.";
    }

    if (!isValidEmail(email)) {
        return "Introduce un email válido.";
    }

    if (!validStatuses.includes(status)) {
        return "El estado del cliente no es válido.";
    }

    return "";
}

async function getClients(req, res) {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients);
}

async function createClient(req, res) {
    const { name, phone, email, address, status } = req.body;
    const validationMessage = validateClient(req.body);

    if (validationMessage) {
        return res.status(400).json({ message: validationMessage });
    }

    const client = await Client.create({
        name,
        phone,
        email: email || "",
        address: address || "",
        status,
    });

    res.status(201).json(client);
}

async function updateClient(req, res) {
    const { name, phone, email, address, status } = req.body;
    const validationMessage = validateClient(req.body);

    if (validationMessage) {
        return res.status(400).json({ message: validationMessage });
    }

    const client = await Client.findByIdAndUpdate(
        req.params.id,
        {
            name,
            phone,
            email: email || "",
            address: address || "",
            status,
        },
        { new: true, runValidators: true },
    );

    if (!client) {
        return res.status(404).json({ message: "Cliente no encontrado." });
    }

    res.json(client);
}

async function deleteClient(req, res) {
    const client = await Client.findByIdAndDelete(req.params.id);

    if (!client) {
        return res.status(404).json({ message: "Cliente no encontrado." });
    }

    res.sendStatus(204);
}

module.exports = {
    createClient,
    deleteClient,
    getClients,
    updateClient,
};
