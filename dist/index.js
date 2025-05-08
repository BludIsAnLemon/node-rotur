"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoturClient = void 0;
exports.generateId = generateId;
const ws_1 = __importDefault(require("ws"));
const node_events_1 = require("node:events");
const crypto_1 = __importDefault(require("crypto"));
const axios_1 = __importDefault(require("axios"));
/**
 * Utility.
 * Generates a pre-authorized username to use when setting your id.
 * @param [designation='rtr'] - The designation of your id. The list of designations can be found at: https://docs.rotur.dev/your-connection/rotur-designations
 * @returns {string} The generated id.
 */
function generateId(designation = 'rtr') {
    return `${designation}-${Array.from({ length: 32 }, () => {
        const charCode = Math.random() < 0.5
            ? 65 + Math.floor(Math.random() * 26)
            : 97 + Math.floor(Math.random() * 26);
        return String.fromCharCode(charCode);
    }).join('')}`;
}
class RoturClient extends node_events_1.EventEmitter {
    RoturSocket;
    password;
    username;
    user_token;
    constructor() {
        super();
        this.RoturSocket = new ws_1.default('wss://ws.rotur.dev');
        this.password = '';
        this.username = '';
        this.user_token = '';
        this.RoturSocket.on('open', () => {
            this.RoturSocket.on('message', (data) => {
                try {
                    const stringifiedData = data.toString();
                    const parsedData = JSON.parse(stringifiedData);
                    this.emit('data', parsedData);
                }
                catch (e) {
                    this.emit('error', e);
                    console.error(e);
                }
            });
        });
    }
    inObj(obj, ...props) {
        return props.every(prop => prop in obj);
    }
    sendToRotur(data, successStatement) {
        return new Promise((resolve, reject) => {
            const errorHandler = reject;
            const handler = (receivedData) => {
                try {
                    const stringifiedData = receivedData.toString();
                    const parsedData = JSON.parse(stringifiedData);
                    const cleanup = () => {
                        this.RoturSocket.removeListener('error', errorHandler);
                        this.RoturSocket.removeListener('message', handler);
                    };
                    if (typeof successStatement === 'function') {
                        cleanup();
                        resolve(successStatement(parsedData));
                    }
                    else if ('code_id' in parsedData) {
                        cleanup();
                        resolve((parsedData.code_id === 100));
                    }
                }
                catch (e) {
                    console.error(e);
                    reject(e);
                }
            };
            this.RoturSocket.send(JSON.stringify(data));
            this.RoturSocket.on('error', errorHandler);
            this.RoturSocket.on('message', handler);
        });
    }
    on(event, listener) {
        return super.on(event, listener);
    }
    once(event, listener) {
        return super.once(event, listener);
    }
    emit(event, ...args) {
        return super.emit(event, ...args);
    }
    async sendHandshake(callback) {
        const succeed = await this.sendToRotur({
            cmd: "handshake",
            val: {
                language: "Javascript",
                version: {
                    editorType: "Scratch", // As per Rotur docs – unclear but have to stay safe
                    versionNumber: 3
                }
            },
            listener: "handshake_cfg"
        });
        if (typeof callback === 'function') {
            callback(succeed);
        }
        return succeed;
    }
    async setID(id, callback) {
        const succeed = await this.sendToRotur({
            cmd: "setid",
            value: id,
            listener: "username_cfg"
        });
        if (typeof callback === 'function') {
            callback(succeed);
        }
        return succeed;
    }
    async linkToRoom(room, callback) {
        const succeed = await this.sendToRotur({
            cmd: "link",
            val: [
                room
            ],
            listener: "link"
        });
        if (typeof callback === 'function') {
            callback(succeed);
        }
        return succeed;
    }
    async login(username, password, callback) {
        try {
            const p = crypto_1.default.createHash('md5').update(password).digest('hex');
            const succeed = await this.sendToRotur({
                cmd: "pmsg",
                val: {
                    id: "",
                    command: "login",
                    source: "0",
                    client: {
                        system: "originOS", // Same thing - have to stick with the documentation
                        version: "v5.5.4"
                    },
                    payload: [
                        this.username.length >= 1 ? this.username : username,
                        this.password.length >= 1 ? this.password : p
                    ],
                    timestamp: Date.now()
                },
                id: "sys-rotur"
            }, (data) => {
                return [
                    'val' in data && 'token' in data.val,
                    ('val' in data && 'token' in data.val) ? data.val.token : undefined
                ];
            });
            if (typeof callback === 'function') {
                callback(succeed[0], succeed[1]);
            }
            if (succeed[0]) {
                this.password = p;
                this.username = username;
            }
            if (typeof succeed[1] !== 'undefined') {
                this.user_token = succeed[1];
            }
            return succeed[0];
        }
        catch (e) {
            this.emit('error', e);
            console.error(e);
            return false;
        }
    }
    // I just changed the login code lol
    async loginMD5(username, password, callback) {
        try {
            const p = password;
            const succeed = await this.sendToRotur({
                cmd: "pmsg",
                val: {
                    id: "",
                    command: "login",
                    source: "0",
                    client: {
                        system: "originOS", // Same thing - have to stick with the documentation
                        version: "v5.5.4"
                    },
                    payload: [
                        this.username.length >= 1 ? this.username : username,
                        this.password.length >= 1 ? this.password : p
                    ],
                    timestamp: Date.now()
                },
                id: "sys-rotur"
            }, (data) => {
                return [
                    'val' in data && 'token' in data.val,
                    ('val' in data && 'token' in data.val) ? data.val.token : undefined
                ];
            });
            if (typeof callback === 'function') {
                callback(succeed[0], succeed[1]);
            }
            if (succeed[0]) {
                this.password = p;
                this.username = username;
            }
            if (typeof succeed[1] !== 'undefined') {
                this.user_token = succeed[1];
            }
            return succeed[0];
        }
        catch (e) {
            this.emit('error', e);
            console.error(e);
            return false;
        }
    }
    async auth(token, callback) {
        const succeed = await this.sendToRotur({
            cmd: "auth",
            value: token,
        });
        if (typeof callback === 'function') {
            callback(succeed);
        }
        if (succeed) {
            this.emit('authenticated');
        }
        return succeed;
    }
    async getUserData() {
        try {
            if (!this.user_token)
                throw new Error('You aren\'t authenticated yet!');
            return await axios_1.default.get(`https://social.rotur.dev/get_user?username=${this.username}&password=${this.password}`);
        }
        catch (e) {
            console.error(e);
            this.emit('error', e);
        }
    }
    async transferCurrency(amount, recipient, note) {
        try {
            if (!this.user_token)
                throw new Error('You aren\'t authenticated yet!');
            return await this.sendToRotur({
                cmd: "pmsg",
                val: {
                    id: this.user_token,
                    client: {
                        system: "originOS",
                        version: "v5.5.4"
                    },
                    payload: {
                        recipient,
                        amount,
                        note
                    },
                    command: "currency_transfer"
                },
                id: "sys-rotur"
            }, (parsed) => {
                return parsed.val.payload === "Transfer Successful";
            });
        }
        catch (e) {
            console.error(e);
            this.emit('error', e);
            return false;
        }
    }
}
exports.RoturClient = RoturClient;
