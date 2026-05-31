const Quote = require("../models/Quote");
const Client = require("../models/Client");
const Installation = require("../models/Installation");

const validStatuses = ["Pendiente", "Material pedido", "En instalación", "Finalizada", "Incidencia"];

function getBatterySummary(quote) {
    if (!quote.batteryBrand || quote.batteryBrand === "Sin batería") {
        return "Sin batería";
    }

    return `${quote.batteryBrand} ${quote.batteryModel} (${quote.batteryUnits || 0} módulos)`;
}

function buildInstallationPayload(body, quote, client) {
    return {
        address: body.address || client.address || "",
        batterySummary: getBatterySummary(quote),
        quoteId: quote.id,
        clientId: quote.clientId,
        installPower: Number(quote.installPower),
        inverterModel: quote.inverterModel,
        notes: body.notes || "",
        panelCount: Number(quote.panelCount),
        panelModel: quote.panelModel,
        scheduledDate: body.scheduledDate || "",
        status: body.status || "Pendiente",
    };
}

async function getInstallations(req, res) {
    const installations = await Installation.find().sort({ createdAt: -1 });
    res.json(installations);
}

async function createInstallation(req, res) {
    const { quoteId, status } = req.body;

    if (!quoteId) {
        return res.status(400).json({ message: "Selecciona un presupuesto aceptado." });
    }

    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ message: "El estado de instalación no es válido." });
    }

    const quote = await Quote.findById(quoteId);

    if (!quote) {
        return res.status(404).json({ message: "Presupuesto no encontrado." });
    }

    if (quote.status !== "Aceptado") {
        return res.status(400).json({ message: "Solo se pueden instalar presupuestos aceptados." });
    }

    const existingInstallation = await Installation.findOne({ quoteId });

    if (existingInstallation) {
        return res.status(409).json({ message: "Este presupuesto ya tiene instalación." });
    }

    const client = await Client.findById(quote.clientId);

    if (!client) {
        return res.status(400).json({ message: "El cliente del presupuesto no existe." });
    }

    const installation = await Installation.create(buildInstallationPayload(req.body, quote, client));
    res.status(201).json(installation);
}

async function updateInstallation(req, res) {
    const { address, notes, scheduledDate, status } = req.body;

    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ message: "El estado de instalación no es válido." });
    }

    const installation = await Installation.findByIdAndUpdate(
        req.params.id,
        {
            address: address || "",
            notes: notes || "",
            scheduledDate: scheduledDate || "",
            status: status || "Pendiente",
        },
        { new: true, runValidators: true },
    );

    if (!installation) {
        return res.status(404).json({ message: "Instalación no encontrada." });
    }

    res.json(installation);
}

async function deleteInstallation(req, res) {
    const installation = await Installation.findByIdAndDelete(req.params.id);

    if (!installation) {
        return res.status(404).json({ message: "Instalación no encontrada." });
    }

    res.sendStatus(204);
}

module.exports = {
    createInstallation,
    deleteInstallation,
    getInstallations,
    updateInstallation,
};
