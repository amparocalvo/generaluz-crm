const crypto = require("crypto");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["admin", "comercial"],
            default: "admin",
        },
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            transform: (doc, ret) => {
                ret.id = ret._id;
                delete ret._id;
                delete ret.password;
                return ret;
            },
        },
    },
);

userSchema.statics.password = function password(passwordValue) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(passwordValue, salt, 64).toString("hex");

    return `${salt}:${hash}`;
};

userSchema.methods.checkPassword = function checkPassword(password) {
    if (typeof this.password !== "string" || !this.password.includes(":")) {
        return false;
    }

    const [salt, storedHash] = this.password.split(":");
    const hash = crypto.scryptSync(password, salt, 64);
    const storedHashBuffer = Buffer.from(storedHash, "hex");

    return (
        storedHashBuffer.length === hash.length &&
        crypto.timingSafeEqual(storedHashBuffer, hash)
    );
};

module.exports = mongoose.model("User", userSchema);
