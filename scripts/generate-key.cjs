const crypto = require('crypto');

const SECRET = process.env.LICENSE_SECRET || 'skm-2026-license-secret';

function makeKey(machineId, expiresAt) {
    const h = crypto.createHmac('sha256', SECRET).update(`${machineId}|${expiresAt}`).digest('hex').toUpperCase();
    return `${h.slice(0,4)}-${h.slice(4,8)}-${h.slice(8,12)}-${h.slice(12,16)}`;
}

const machineId = process.argv[2];
const dateArg = process.argv[3];

if (!machineId || !dateArg) {
    console.log('Usage: node scripts/generate-key.cjs <MACHINE_ID> <YYYY-MM-DD>');
    console.log('Example: node scripts/generate-key.cjs A1B2C3D4E5F6 2027-12-31');
    process.exit(1);
}

const ts = new Date(dateArg).getTime();
if (isNaN(ts)) {
    console.error('Invalid date. Use YYYY-MM-DD format.');
    process.exit(1);
}

console.log('Machine ID:', machineId);
console.log('Expiry Date:', dateArg);
console.log('License Key:', makeKey(machineId.trim(), ts));
