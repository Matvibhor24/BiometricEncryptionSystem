const crypto = require('crypto');
const fs = require('fs');

// Generate a cryptographic key from a string (in place of biometric data)
function generateKeyFromString(keyString) {
    const hash = crypto.createHash('sha256');
    hash.update(keyString);
    return hash.digest();
}

// Encrypt a file using AES-256-CBC
async function encryptFile(key, fileData, outputFilePath) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const output = fs.createWriteStream(outputFilePath);

    return new Promise((resolve, reject) => {
        cipher.once('error', reject);
        output.once('error', reject);
        output.once('finish', () => resolve(iv.toString('hex')));

        const input = Buffer.from(fileData, 'binary');
        cipher.write(input);
        cipher.end();
    });
}

// Decrypt a file using AES-256-CBC
async function decryptFile(key, ivHex, filePath, outputFilePath) {
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const input = fs.createReadStream(filePath);
    const output = fs.createWriteStream(outputFilePath);

    return new Promise((resolve, reject) => {
        decipher.once('error', reject);
        output.once('error', reject);
        output.once('finish', resolve);

        input.pipe(decipher).pipe(output);
    });
}

module.exports = {
    generateKeyFromString,
    encryptFile,
    decryptFile
};
