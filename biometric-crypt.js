const crypto = require('crypto');
const fs = require('fs').promises;

// Generate a cryptographic key from a string (in place of biometric data)
function generateKeyFromString(keyString) {
    const hash = crypto.createHash('sha256');
    hash.update(keyString);
    return hash.digest();
}

// Encrypt a file using AES-256-CBC
async function encryptFile(key, filePath, outputFilePath) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const input = await fs.readFile(filePath);
    const encrypted = Buffer.concat([cipher.update(input), cipher.final()]);

    await fs.writeFile(outputFilePath, Buffer.concat([iv, encrypted]));
    return iv.toString('hex');
}

// Decrypt a file using AES-256-CBC
async function decryptFile(key, ivHex, filePath, outputFilePath) {
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const encrypted = await fs.readFile(filePath);
    const decrypted = Buffer.concat([decipher.update(encrypted.slice(16)), decipher.final()]);

    await fs.writeFile(outputFilePath, decrypted);
}

module.exports = {
    generateKeyFromString,
    encryptFile,
    decryptFile
};
