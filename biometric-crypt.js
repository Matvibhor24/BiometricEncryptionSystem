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
    cipher.pipe(output);

    output.on('finish', () => {
        console.log('File encrypted successfully.');
    });

    return iv.toString('hex');
}

// Decrypt a file using AES-256-CBC
function decryptFile(key, ivHex, fileData, outputFilePath) {
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const output = fs.createWriteStream(outputFilePath);

    decipher.write(fileData);
    decipher.end();
    decipher.pipe(output);

    output.on('finish', () => {
        console.log('File decrypted successfully.');
    });
}

module.exports = {
    generateKeyFromString,
    encryptFile,
    decryptFile
};
