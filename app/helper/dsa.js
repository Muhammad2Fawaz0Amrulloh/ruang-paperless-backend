const crypto = require('crypto');

module.exports = {
    // Fungsi untuk membuat tanda tangan digital menggunakan DSA
    signWithDSA: (privateKey, data) => {
        const sign = crypto.createSign('SHA256');
        sign.update(data);
        return sign.sign(privateKey, 'hex');
    },

    // Fungsi untuk memverifikasi tanda tangan digital menggunakan DSA
    verifyWithDSA: (publicKey, data, signature) => {
        const verify = crypto.createVerify('SHA256');
        verify.update(data);
        return verify.verify(publicKey, signature, 'hex');
    },

    // Fungsi untuk mengenkripsi data menggunakan AES-128
    encryptWithAES: (data, key, iv) => {
        const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    },

    // Fungsi untuk mendekripsi data menggunakan AES-128
    decryptWithAES: (encryptedData, key, iv) => {
        const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}
