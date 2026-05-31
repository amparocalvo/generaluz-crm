const crypto = require("crypto");

const TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET || "generaluz-local-secret";
const TOKEN_DURATION_MS = 8 * 60 * 60 * 1000;

function base64UrlEncode(value) {
    return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(value) {
    return crypto.createHmac("sha256", TOKEN_SECRET).update(value).digest("base64url");
}

function createToken(user) {
    const payload = {
        exp: Date.now() + TOKEN_DURATION_MS,
        userId: user.id,
    };
    const encodedPayload = base64UrlEncode(payload);

    return `${encodedPayload}.${sign(encodedPayload)}`;
}

function verifyToken(token) {
    if (!token || !token.includes(".")) {
        return null;
    }

    const [encodedPayload, signature] = token.split(".");
    const expectedSignature = sign(encodedPayload);

    if (signature !== expectedSignature) {
        return null;
    }

    try {
        const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));

        if (!payload.exp || payload.exp < Date.now()) {
            return null;
        }

        return payload;
    } catch (error) {
        return null;
    }
}

module.exports = {
    createToken,
    verifyToken,
};
