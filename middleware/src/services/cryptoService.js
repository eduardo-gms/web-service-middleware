const CryptoJS = require('crypto-js');

// Pega a chave do .env
const SECRET_KEY = process.env.CRYPTO_KEY;

/**
 * Criptografa um texto usando AES. [cite: 53]
 * @param {string} text Texto puro (ex: CPF)
 * @returns {string} Texto criptografado em base64
 */
const encrypt = (text) => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

/**
 * Descriptografa um texto usando AES. [cite: 54]
 * @param {string} cipherText Texto criptografado
 * @returns {string} Texto puro
 */
const decrypt = (cipherText) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = {
  encrypt,
  decrypt,
};