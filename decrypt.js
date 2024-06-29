const biometricCrypt = require('./biometric-crypt');

// Use the same predefined key string
const keyString = 'my-secret-key'; // Replace with your secret key
const key = biometricCrypt.generateKeyFromString(keyString);

// Replace with the IV you got during encryption
const ivHex = 'initialization-vector-from-encrypt.js';

biometricCrypt.decryptFile(key, ivHex, 'path/to/encrypted/file.enc', 'path/to/decrypted/file.pdf');
