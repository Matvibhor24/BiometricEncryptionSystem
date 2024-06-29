const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const biometricCrypt = require('./biometric-crypt');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for file uploads
app.use(fileUpload());

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});