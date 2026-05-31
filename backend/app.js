require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const authRoutes = require("./routes/auth.routes");
const quoteRoutes = require("./routes/quotes.routes");
const clientRoutes = require("./routes/clients.routes");
const installationRoutes = require("./routes/installations.routes");
const requireAuth = require("./middleware/auth.middleware");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/solar_crm";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@generaluz.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Generaluz123";

async function migrateLegacyQuoteData() {

    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map((collection) => collection.name);

    if (collectionNames.includes("budgets") && !collectionNames.includes("quotes")) {
        await mongoose.connection.db.collection("budgets").rename("quotes");
        console.log("Colección budgets renombrada a quotes");
    }

    if (collectionNames.includes("installations")) {
        await mongoose.connection.db.collection("installations").updateMany(
            { budgetId: { $exists: true }, quoteId: { $exists: false } },
            [
                { $set: { quoteId: "$budgetId" } },
                { $unset: "budgetId" },
            ],
        );
    }
}

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
    
    const allowedOrigins = ["http://localhost:5173"];
    const requestOrigin = req.headers.origin;

    if (allowedOrigins.includes(requestOrigin)) {
        res.setHeader("Access-Control-Allow-Origin", requestOrigin);
    }

    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

app.get("/", (req, res) => {
    res.json({ message: "Generaluz CRM API" });
});

app.use("/api/auth", authRoutes);

app.use("/api/clients", requireAuth, clientRoutes);

app.use("/api/quotes", requireAuth, quoteRoutes);

app.use("/api/installations", requireAuth, installationRoutes);

app.use((error, req, res, next) => {
    console.error(error);

    if (error.name === "CastError") {
        return res.status(400).json({ message: "Identificador no válido." });
    }

    if (error.name === "ValidationError") {
        return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Error interno del servidor." });
});

mongoose
    .connect(MONGODB_URI)
    .then(async () => {
        await migrateLegacyQuoteData();

        const userCount = await User.countDocuments();

        if (userCount === 0) {
            await User.create({
                email: ADMIN_EMAIL,
                name: "Administrador",
                password: User.password(ADMIN_PASSWORD),
                role: "admin",
            });
            console.log(`Usuario creado: ${ADMIN_EMAIL}`);
        }

        app.listen(PORT, () => {
            console.log(`El servidor se ha iniciado en el puerto ${PORT}`);
            console.log("MongoDB conectado");
        });
    })

    .catch((error) => {
        console.error("No se pudo conectar a MongoDB");
        console.error(error.message);
        process.exit(1);
    });
