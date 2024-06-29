const crypto = require('crypto');
const fs = require('fs');

// Generate a cryptographic key from a string (in place of biometric data)
function generateKeyFromString(keyString) {
    const hash = crypto.createHash('sha256');
    hash.update(keyString);
    return hash.digest();
}

// Encrypt a file using AES-256-CBC
function encryptFile(key, fileData, outputFilePath) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const output = fs.createWriteStream(outputFilePath);

    cipher.write(fileData);
    cipher.end();

    return new Promise((resolve, reject) => {
        output.on('finish', () => {
            console.log('File encrypted successfully.');
            resolve(iv.toString('hex'));
        });
        output.on('error', reject);
    });
}

// Decrypt a file using AES-256-CBC (if needed)

module.exports = {
    generateKeyFromString,
    encryptFile,
    // Add decryptFile if needed
};
