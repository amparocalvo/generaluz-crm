const mongoose = require("mongoose");

const installationSchema = new mongoose.Schema(
    {
        quoteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quote",
            required: true,
        },
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Client",
            required: true,
        },
        address: {
            type: String,
            default: "",
            trim: true,
        },
        scheduledDate: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["Pendiente", "Material pedido", "En instalación", "Finalizada", "Incidencia"],
            default: "Pendiente",
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
        inverterModel: {
            type: String,
            required: true,
        },
        installPower: {
            type: Number,
            required: true,
            min: 0,
        },
        batterySummary: {
            type: String,
            default: "Sin batería",
        },
        notes: {
            type: String,
            default: "",
            trim: true,
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

module.exports = mongoose.model("Installation", installationSchema);
