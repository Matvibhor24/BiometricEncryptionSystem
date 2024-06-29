const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const biometricCrypt = require('./biometric-crypt');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for file uploads
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Decrypt endpoint
app.post('/decrypt', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const encryptedFile = req.files.encryptedFile;
    const ivHex = req.body.ivHex;
    const keyString = req.body.keyString; // The predefined key string
    const key = biometricCrypt.generateKeyFromString(keyString);

    const uploadPath = path.join(__dirname, 'uploads', encryptedFile.name);
    const outputFilePath = path.join(__dirname, 'uploads', 'decrypted-' + encryptedFile.name);

    // Save the uploaded file
    encryptedFile.mv(uploadPath, (err) => {
        if (err) return res.status(500).send(err);

        // Decrypt the file
        biometricCrypt.decryptFile(key, ivHex, uploadPath, outputFilePath);

        // Send the decrypted file
        res.download(outputFilePath, (err) => {
            if (err) return res.status(500).send(err);

            // Clean up files after download
            fs.unlinkSync(uploadPath);
            fs.unlinkSync(outputFilePath);
        });
    });
});

// Encrypt endpoint
app.post('/encrypt', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const fileToEncrypt = req.files.fileToEncrypt;
    const keyString = req.body.keyString; // The predefined key string
    const key = biometricCrypt.generateKeyFromString(keyString);

    const uploadPath = path.join(__dirname, 'uploads', fileToEncrypt.name);
    const outputFilePath = path.join(__dirname, 'uploads', 'encrypted-' + fileToEncrypt.name);

    // Save the uploaded file
    fileToEncrypt.mv(uploadPath, (err) => {
        if (err) return res.status(500).send(err);

        // Encrypt the file
        const ivHex = biometricCrypt.encryptFile(key, uploadPath, outputFilePath);

        res.json({
            ivHex: ivHex,
            encryptedFilePath: `uploads/encrypted-${fileToEncrypt.name}`
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
