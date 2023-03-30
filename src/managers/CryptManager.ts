import crypto from "crypto";

const algorithm = "aes-256-gcm";
const ivLength = 16;
const tagLength = 16;
const saltLength = 64;
const pbkdf2Iterations = 10000;
const secret = process.env.CRYPTO_KEY;

const tagPosition = saltLength + ivLength;
const encryptedPosition = tagPosition + tagLength;

class CryptManager {
    constructor() {
        if(!secret || typeof secret !== "string")
            throw new TypeError(`CryptManager: secret must be a non-0-length string`);
    }

    _getKey(salt: Buffer) {
        return crypto.pbkdf2Sync(secret, salt, pbkdf2Iterations, 32, "sha512");
    }

    encrypt(value: string) {
        if(value == null) return { result: "error", msg: "valueNull" };

        const iv = crypto.randomBytes(ivLength);
        const salt = crypto.randomBytes(saltLength);

        const key = this._getKey(salt);

        const cipher = crypto.createCipheriv(algorithm, key, iv);
        const encrypted = Buffer.concat([ cipher.update(String(value), "utf8"), cipher.final() ]);

        const tag = cipher.getAuthTag();

        return Buffer.concat([ salt, iv, tag, encrypted ]).toString("hex");
    }

    decrypt(value: string) {
        if(value == null) return { result: "error", msg: "valueNull" };

        const stringValue = Buffer.from(String(value), "hex");

        const salt = stringValue.slice(0, saltLength);
        const iv = stringValue.slice(saltLength, tagPosition);
        const tag = stringValue.slice(tagPosition, encryptedPosition);
        const encrypted = stringValue.slice(encryptedPosition);

        const key = this._getKey(salt);

        const decipher = crypto.createDecipheriv(algorithm, key, iv);

        decipher.setAuthTag(tag);

        return decipher.update(encrypted) + decipher.final("utf8");
    }
}

export default CryptManager;