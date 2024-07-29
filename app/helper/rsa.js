const crypto = require('crypto');

module.exports = {
    // Fungsi untuk membuat tanda tangan digital menggunakan RSA
    signWithRSA: (privateKey, data) => {
        const sign = crypto.createSign('SHA256');
        sign.update(data);
        return sign.sign(privateKey, 'base64');
    },

    // Fungsi untuk memverifikasi tanda tangan digital menggunakan RSA
    verifyWithRSA: (publicKey, data, signature) => {
        const verify = crypto.createVerify('SHA256');
        verify.update(data);
        return verify.verify(publicKey, signature, 'base64');
    },
}