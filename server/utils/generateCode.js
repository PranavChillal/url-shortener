const crypto = require("crypto");

const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function generateCode(length = 7) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[crypto.randomInt(ALPHABET.length)];
  }
  return code;
}

module.exports = generateCode;