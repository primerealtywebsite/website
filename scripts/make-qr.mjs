// Generates static QR codes for the desktop contact panel. Run: node scripts/make-qr.mjs
import QRCode from "qrcode";
import fs from "node:fs";
const PHONE = "+18132958215";
const opts = { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#121316", light: "#ffffff" } };
fs.writeFileSync("public/qr/call-prime1.svg", await QRCode.toString(`tel:${PHONE}`, opts));
console.log("QR codes written");
