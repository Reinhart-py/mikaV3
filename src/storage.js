const mongoose = require('mongoose');
const chalk = require('chalk');

const soulSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    session: { type: String, required: true },
    username: String,
    uid: String,
    loot: { type: Number, default: 0 },
    created: { type: Date, default: Date.now }
});

const Soul = mongoose.model('Soul', soulSchema);

const penetrateCloud = async (uri) => {
    try {
        await mongoose.connect(uri);
        return true;
    } catch (e) {
        return false;
    }
};

const buryBody = async (phone, session, me) => {
    const exists = await Soul.findOne({ phone });
    if (exists) {
        exists.session = session;
        exists.username = me.username || 'Anon';
        exists.uid = me.id.toString();
        await exists.save();
    } else {
        await new Soul({
            phone,
            session,
            username: me.username || 'Anon',
            uid: me.id.toString()
        }).save();
    }
};

const digUpBodies = async () => {
    return await Soul.find({});
};

const burnBody = async (phone) => {
    await Soul.deleteOne({ phone });
};

module.exports = { penetrateCloud, buryBody, digUpBodies, burnBody };
