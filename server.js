const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const biometricCrypt = require('./biometric-crypt');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for file uploads
app.use(fileUpload());
app.use(express.static('public'));

// Encrypt endpoint
app.post('/encrypt', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const fileToEncrypt = req.files.fileToEncrypt;
    const keyString = req.body.keyString; // Replace with your secret key
    const key = biometricCrypt.generateKeyFromString(keyString);

    // Create a unique filename for the encrypted file
    const encryptedFilePath = path.join(__dirname, 'uploads', `encrypted-${fileToEncrypt.name}`);

    // Encrypt the file
    const ivHex = biometricCrypt.encryptFile(key, fileToEncrypt.data, encryptedFilePath);

    // Send response with IV and download link
    res.json({ ivHex, encryptedFilePath: `/uploads/encrypted-${fileToEncrypt.name}` });
});

// Decrypt endpoint
app.post('/decrypt', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const encryptedFile = req.files.encryptedFile;
    const ivHex = req.body.ivHex;
    const keyString = req.body.keyString; // Replace with your secret key
    const key = biometricCrypt.generateKeyFromString(keyString);

    // Create a unique filename for the decrypted file
    const decryptedFilePath = path.join(__dirname, 'uploads', `decrypted-${encryptedFile.name}`);

    // Decrypt the file
    biometricCrypt.decryptFile(key, ivHex, encryptedFile.data, decryptedFilePath);

    // Send response with download link
    res.json({ decryptedFilePath: `/uploads/decrypted-${encryptedFile.name}` });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
