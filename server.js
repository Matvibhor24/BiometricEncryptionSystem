// server.js

const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const biometricCrypt = require('./biometric-crypt');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for file uploads
app.use(fileUpload());

// Serve static files from the 'public' directory (for index.html)
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html as the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Encrypt endpoint
app.post('/encrypt', async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    try {
        const fileToEncrypt = req.files.fileToEncrypt;
        const keyString = req.body.keyString; // Replace with your secret key
        const key = biometricCrypt.generateKeyFromString(keyString);

        // Create a unique filename for the encrypted file
        const encryptedFileName = `encrypted-${fileToEncrypt.name}`;
        const encryptedFilePath = path.join(__dirname, 'uploads', encryptedFileName);

        // Encrypt the file
        const ivHex = await biometricCrypt.encryptFile(key, fileToEncrypt.data, encryptedFilePath);

        // Send response with IV and encrypted file path
        res.json({ ivHex, encryptedFileName });
    } catch (error) {
        console.error('Encryption error:', error);
        res.status(500).send('Encryption failed');
    }
});

// Serve files from the 'uploads' directory for download
app.use('/download', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
