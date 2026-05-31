const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema(
    {
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Client",
            required: true,
        },
        concept: {
            type: String,
            required: true,
            enum: ["Instalación residencial", "Instalación empresa"],
        },
        consumptionMode: {
            type: String,
            enum: ["annual", "monthly"],
            default: "annual",
        },
        monthlyConsumption: {
            type: [Number],
            default: () => Array(12).fill(0),
        },
        annualConsumption: {
            type: Number,
            required: true,
            min: 0,
        },
        annualProduction: {
            type: Number,
            required: true,
            min: 0,
        },
        coverage: {
            type: Number,
            required: true,
            min: 0,
        },
        maxPanels: {
            type: Number,
            default: null,
            min: 1,
        },
        panelCount: {
            type: Number,
            required: true,
            min: 1,
        },
        panelModel: {
            type: String,
            required: true,
        },
        inverterBrand: {
            type: String,
            required: true,
            enum: ["Huawei", "Deye", "Victron"],
        },
        inverterModel: {
            type: String,
            required: true,
        },
        installPower: {
            type: Number,
            required: true,
            min: 0,
        },
        batteryBrand: {
            type: String,
            enum: ["Sin batería", "Huawei", "Deye", "Pylontech"],
            default: "Sin batería",
        },
        batteryModel: {
            type: String,
            default: "",
        },
        batteryUnits: {
            type: Number,
            default: null,
            min: 1,
        },
        batteryCapacity: {
            type: Number,
            default: null,
            min: 0,
        },
        total: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ["Borrador", "Enviado", "Aceptado", "Rechazado"],
            default: "Borrador",
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform: (doc, ret) => {
                delete ret._id;
                return ret;
            },
        },
    },
);

module.exports = mongoose.model("Quote", quoteSchema);
