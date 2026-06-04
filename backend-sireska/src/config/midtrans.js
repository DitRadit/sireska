const midtransClient = require("midtrans-client");

console.log("=== MIDTRANS CONFIG ===");
console.log("SERVER KEY:", process.env.MIDTRANS_SERVER_KEY);
console.log("IS PRODUCTION:", process.env.MIDTRANS_IS_PRODUCTION);
console.log("======================");

const snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey:    process.env.MIDTRANS_SERVER_KEY,
    clientKey:    process.env.MIDTRANS_CLIENT_KEY,
});

const coreApi = new midtransClient.CoreApi({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey:    process.env.MIDTRANS_SERVER_KEY,
    clientKey:    process.env.MIDTRANS_CLIENT_KEY,
});

module.exports = { snap, coreApi };