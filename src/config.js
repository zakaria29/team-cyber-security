const base_url = "http://localhost/lumen_cyber/api/v2"
const storage_url = "http://localhost/lumen_cyber/storage/files/"

const cryptoJS = require("crypto-js")
const secretKey = 'CyberJoss2021'
let encrypt = plainText => {
    return cryptoJS.AES.encrypt(plainText, secretKey).toString()
}

let decrypt = chiperText => {
    let byte = cryptoJS.AES.decrypt(chiperText, secretKey)
    return byte.toString(cryptoJS.enc.Utf8)
}
export {
    base_url, storage_url, encrypt, decrypt
}