const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const biometricCrypt = require('./biometric-crypt');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for file uploads
app.use(fileUpload());

// Serve index.html as the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Encrypt endpoint
app.post('/encrypt', async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    try {
        const fileToEncrypt = req.files.fileToEncrypt;
        const keyString = 'my-secret-key'; // Replace with your secret key
        const key = biometricCrypt.generateKeyFromString(keyString);

        // Create a unique filename for the encrypted file
        const encryptedFilePath = path.join(__dirname, 'uploads', `encrypted-${fileToEncrypt.name}`);

        // Encrypt the file
        const ivHex = await biometricCrypt.encryptFile(key, fileToEncrypt.tempFilePath, encryptedFilePath);

        // Send response with IV and encrypted file path
        res.json({ ivHex, encryptedFilePath });
    } catch (error) {
        console.error('Encryption error:', error);
        res.status(500).send('Encryption failed');
    }
});

// Decrypt endpoint
app.post('/decrypt', async (req, res) => {
    if (!req.body.ivHex || !req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('Invalid request parameters.');
    }

    try {
        const ivHex = req.body.ivHex;
        const fileToDecrypt = req.files.fileToDecrypt;
        const keyString = 'my-secret-key'; // Replace with your secret key
        const key = biometricCrypt.generateKeyFromString(keyString);

        // Create a unique filename for the decrypted file
        const decryptedFilePath = path.join(__dirname, 'downloads', `decrypted-${fileToDecrypt.name}`);

        // Decrypt the file
        await biometricCrypt.decryptFile(key, ivHex, fileToDecrypt.tempFilePath, decryptedFilePath);

        // Send response with decrypted file path
        res.download(decryptedFilePath, (err) => {
            if (err) {
                console.error('Download error:', err);
                res.status(500).send('Download failed');
            }
            // Clean up decrypted file after download
            fs.unlinkSync(decryptedFilePath);
        });
    } catch (error) {
        console.error('Decryption error:', error);
        res.status(500).send('Decryption failed');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
