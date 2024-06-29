const biometricCrypt = require('./biometric-crypt');

// Use a predefined key string
const keyString = 'my-secret-key'; // Replace with your secret key
const key = biometricCrypt.generateKeyFromString(keyString);

// Correctly formatted file paths
const inputFilePath = 'C:\\Users\\Vibhor Mathur\\Downloads\\Vibhor Mathur-Resume \'24.docx (4).pdf';
const outputFilePath = 'C:\\Users\\Vibhor Mathur\\Downloads\\encrypted-file.enc';

// Encrypt the file
const ivHex = biometricCrypt.encryptFile(key, inputFilePath, outputFilePath);

console.log('Initialization Vector:', ivHex);
