// biometric-crypt.js
const crypto = require('crypto');
const fs = require('fs');

// Generate a cryptographic key from a string (in place of biometric data)
function generateKeyFromString(keyString) {
    const hash = crypto.createHash('sha256');
    hash.update(keyString);
    return hash.digest();
}

// Encrypt a file using AES-256-CBC
function encryptFile(key, fileBuffer, outputFilePath) {
    return new Promise((resolve, reject) => {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        const output = fs.createWriteStream(outputFilePath);

        const inputBuffer = Buffer.from(fileBuffer);

        cipher.on('error', reject);
        output.on('error', reject);
        output.on('finish', () => resolve(iv.toString('hex')));

        output.write(cipher.update(inputBuffer));
        output.write(cipher.final());
        output.end();
    });
}

// Decrypt a file using AES-256-CBC
function decryptFile(key, ivHex, fileBuffer, outputFilePath) {
    return new Promise((resolve, reject) => {
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        const output = fs.createWriteStream(outputFilePath);

        const inputBuffer = Buffer.from(fileBuffer);

        decipher.on('error', reject);
        output.on('error', reject);
        output.on('finish', resolve);

        output.write(decipher.update(inputBuffer));
        output.write(decipher.final());
        output.end();
    });
}

module.exports = {
    generateKeyFromString,
    encryptFile,
    decryptFile
};
