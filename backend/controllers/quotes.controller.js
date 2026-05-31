const Quote = require("../models/Quote");
const Client = require("../models/Client");

function normalizeMonthlyConsumption(monthlyConsumption) {
    if (!Array.isArray(monthlyConsumption)) {
        return Array(12).fill(0);
    }

    return Array.from({ length: 12 }, (item, index) => Number(monthlyConsumption[index]) || 0);
}

function buildQuotePayload(body) {
    const {
        clientId,
        concept,
        consumptionMode,
        monthlyConsumption,
        annualConsumption,
        annualProduction,
        coverage,
        maxPanels,
        panelCount,
        panelModel,
        inverterBrand,
        inverterModel,
        installPower,
        batteryBrand,
        batteryModel,
        batteryUnits,
        batteryCapacity,
        total,
        status,
    } = body;

    return {
        clientId,
        concept,
        consumptionMode: consumptionMode || "annual",
        monthlyConsumption: normalizeMonthlyConsumption(monthlyConsumption),
        annualConsumption: Number(annualConsumption),
        annualProduction: Number(annualProduction),
        coverage: Number(coverage),
        maxPanels: maxPanels ? Number(maxPanels) : null,
        panelCount: Number(panelCount),
        panelModel,
        inverterBrand,
        inverterModel,
        installPower: Number(installPower),
        batteryBrand: batteryBrand || "Sin batería",
        batteryModel: batteryModel || "",
        batteryUnits: batteryUnits ? Number(batteryUnits) : null,
        batteryCapacity: batteryCapacity ? Number(batteryCapacity) : null,
        total: Number(total),
        status,
    };
}

function hasRequiredQuoteFields(body) {
    return validateQuote(body) === "";
}

function validateQuote(body) {
    const validConcepts = ["Instalación residencial", "Instalación empresa"];
    const validStatuses = ["Borrador", "Enviado", "Aceptado", "Rechazado"];
    const validBatteryBrands = ["Sin batería", "Huawei", "Deye", "Pylontech"];

    if (!body.clientId) {
        return "Selecciona un cliente.";
    }

    if (!validConcepts.includes(body.concept)) {
        return "Selecciona un concepto válido.";
    }

    if (Number(body.annualConsumption) <= 0) {
        return "El consumo anual debe ser mayor que 0.";
    }

    if (Number(body.annualProduction) <= 0 || Number(body.coverage) <= 0) {
        return "Calcula la producción anual y la cobertura antes de guardar.";
    }

    if (Number(body.panelCount) <= 0 || !body.panelModel) {
        return "Selecciona paneles y calcula el número de unidades.";
    }

    if (!body.inverterBrand || !body.inverterModel) {
        return "Selecciona marca y modelo de inversor.";
    }

    if (Number(body.installPower) <= 0) {
        return "La potencia a instalar debe ser mayor que 0.";
    }

    if (!validBatteryBrands.includes(body.batteryBrand || "Sin batería")) {
        return "La marca de batería no es válida.";
    }

    if (body.batteryBrand && body.batteryBrand !== "Sin batería") {
        if (!body.batteryModel) {
            return "Selecciona el modelo de batería.";
        }

        if (Number(body.batteryUnits) <= 0) {
            return "Indica las unidades de batería.";
        }
    }

    if (Number(body.total) <= 0) {
        return "El total del presupuesto debe ser mayor que 0.";
    }

    if (!validStatuses.includes(body.status)) {
        return "El estado del presupuesto no es válido.";
    }

    return "";
}

async function getQuotes(req, res) {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.json(quotes);
}

async function createQuote(req, res) {
    const validationMessage = validateQuote(req.body);

    if (validationMessage) {
        return res.status(400).json({ message: validationMessage });
    }

    const client = await Client.findById(req.body.clientId);

    if (!client) {
        return res.status(400).json({ message: "El cliente seleccionado no existe." });
    }

    const quote = await Quote.create(buildQuotePayload(req.body));
    res.status(201).json(quote);
}

async function updateQuote(req, res) {
    const validationMessage = validateQuote(req.body);

    if (validationMessage) {
        return res.status(400).json({ message: validationMessage });
    }

    const client = await Client.findById(req.body.clientId);

    if (!client) {
        return res.status(400).json({ message: "El cliente seleccionado no existe." });
    }

    const quote = await Quote.findByIdAndUpdate(
        req.params.id,
        buildQuotePayload(req.body),
        { new: true, runValidators: true },
    );

    if (!quote) {
        return res.status(404).json({ message: "Presupuesto no encontrado." });
    }

    res.json(quote);
}

async function deleteQuote(req, res) {
    const quote = await Quote.findByIdAndDelete(req.params.id);

    if (!quote) {
        return res.status(404).json({ message: "Presupuesto no encontrado." });
    }

    res.sendStatus(204);
}

module.exports = {
    createQuote,
    deleteQuote,
    getQuotes,
    updateQuote,
};
