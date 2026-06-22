const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const TRIAL_DAYS = 30;
const SECRET = process.env.LICENSE_SECRET || 'skm-2026-license-secret';

function getLicensePath(app) {
    return path.join(app.getPath('userData'), 'license.json');
}

function load(app) {
    const fp = getLicensePath(app);
    try {
        if (fs.existsSync(fp)) {
            return JSON.parse(fs.readFileSync(fp, 'utf8'));
        }
    } catch (_) {}
    return null;
}

function save(app, data) {
    fs.writeFileSync(getLicensePath(app), JSON.stringify(data, null, 2), 'utf8');
}

function getMachineId() {
    const ifaces = os.networkInterfaces();
    let mac = 'unknown';
    for (const name of Object.keys(ifaces)) {
        for (const iface of ifaces[name]) {
            if (!iface.internal && iface.mac && iface.mac !== '00:00:00:00:00:00') {
                mac = iface.mac;
                break;
            }
        }
        if (mac !== 'unknown') break;
    }
    const raw = `${mac}-${os.hostname()}-${os.platform()}`;
    return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16).toUpperCase();
}

function makeKey(machineId, expiresAt) {
    const h = crypto.createHmac('sha256', SECRET).update(`${machineId}|${expiresAt}`).digest('hex').toUpperCase();
    return `${h.slice(0,4)}-${h.slice(4,8)}-${h.slice(8,12)}-${h.slice(12,16)}`;
}

function checkLicense(app) {
    const lic = load(app);
    const now = Date.now();
    const machineId = getMachineId();

    if (lic && lic.activated && lic.key === makeKey(lic.machineId || machineId, lic.expiresAt)) {
        const expired = now > lic.expiresAt;
        if (expired) {
            return { valid: false, status: 'expired', machineId, expiredAt: lic.expiresAt };
        }
        const daysLeft = Math.ceil((lic.expiresAt - now) / 86400000);
        return { valid: true, status: 'active', machineId, expiresAt: lic.expiresAt, daysLeft: Math.max(0, daysLeft) };
    }

    if (!lic) {
        save(app, { firstRun: now, activated: false });
        return { valid: true, status: 'trial', daysLeft: TRIAL_DAYS, machineId };
    }

    if (!lic.activated) {
        const firstRun = lic.firstRun || now;
        const elapsed = now - firstRun;
        const daysLeft = Math.max(0, TRIAL_DAYS - Math.floor(elapsed / 86400000));
        if (daysLeft > 0) {
            return { valid: true, status: 'trial', daysLeft, machineId };
        }
        return { valid: false, status: 'expired', machineId };
    }

    return { valid: false, status: 'expired', machineId };
}

function activate(app, key, expiresAt) {
    const machineId = getMachineId();
    const parsed = Number(expiresAt);
    if (!parsed || parsed <= Date.now()) {
        return { success: false, message: 'Expiry date must be in the future' };
    }
    if (key === makeKey(machineId, parsed)) {
        save(app, { activated: true, key, machineId, expiresAt: parsed });
        return { success: true };
    }
    return { success: false, message: 'Invalid license key for this machine' };
}

module.exports = { checkLicense, activate, getMachineId, makeKey };