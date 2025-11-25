const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const input = require('input');
const { NewMessage } = require('telegram/events');

class WarMachine {
    constructor(apiId, apiHash) {
        this.apiId = parseInt(apiId);
        this.apiHash = apiHash;
        this.activeGuns = new Map();
    }

    async hijack(phone) {
        const client = new TelegramClient(new StringSession(""), this.apiId, this.apiHash, {
            deviceModel: "MIKA God Mode",
            appVersion: "69.4.20",
            systemVersion: "Windows 11 Pro",
            connectionRetries: 5
        });

        await client.start({
            phoneNumber: phone,
            password: async () => await input.text("2FA Password (don't f*ck it up): "),
            phoneCode: async () => await input.text("SMS Code (check the phone): "),
            onError: (err) => console.log(err),
        });

        const str = client.session.save();
        const me = await client.getMe();
        await client.disconnect();
        
        return { session: str, me };
    }

    async wakeUpNeo(sessions, callback) {
        const promises = sessions.map(async (s) => {
            try {
                const client = new TelegramClient(new StringSession(s.session), this.apiId, this.apiHash, {
                    connectionRetries: 2
                });
                await client.connect();
                
                client.addEventHandler((event) => {
                    const msg = event.message;
                    if(msg && msg.message) {
                        callback({
                            phone: s.phone,
                            text: msg.message,
                            sender: msg.senderId ? msg.senderId.toString() : 'Ghost'
                        });
                    }
                }, new NewMessage({}));
                
                this.activeGuns.set(s.phone, client);
            } catch (e) {
                // Dead session, ignore
            }
        });
        await Promise.all(promises);
        return this.activeGuns.size;
    }
}

module.exports = { WarMachine };
