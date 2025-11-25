const { machineIdSync } = require('node-machine-id');
const fs = require('fs').promises;
const crypto = require('crypto');
const path = require('path');
const axios = require('axios');

const getMachineSoul = () => {
    try {
        const raw = machineIdSync({ original: true });
        return crypto.createHash('md5').update(raw + 'ReinhartWasHere').digest('hex');
    } catch {
        return 'potato-pc-' + Date.now();
    }
};

const vibeCheck = async () => {
    const keyPath = path.join(process.cwd(), 'license.key');
    
    try {
        const key = (await fs.readFile(keyPath, 'utf8')).trim();
        if (!key) throw new Error("Empty key file");
        
        const hwid = getMachineSoul();
        const payload = { key, hwid, timestamp: Date.now() };
        
        try {
            const { data } = await axios.post('https://jules-api.vercel.app/api/validate', payload, { timeout: 3000 });
            return { passed: data.success, owner: data.owner || 'Ghost' };
        } catch (e) {
            return { passed: true, owner: 'Dev Mode (Offline)' };
        }
    } catch (e) {
        return { passed: false, msg: "Where's the f*cking license key?" };
    }
};

module.exports = { vibeCheck, getMachineSoul };
