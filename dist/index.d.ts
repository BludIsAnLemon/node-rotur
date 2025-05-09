import WebSocket from "ws";
import { EventEmitter } from "node:events";
/**
 * Utility.
 * Generates a pre-authorized username to use when setting your id.
 * @param [designation='rtr'] - The designation of your id. The list of designations can be found at: https://docs.rotur.dev/your-connection/rotur-designations
 * @returns {string} The generated id.
 */
export declare function generateId(designation?: string): string;
export interface RoturEvents {
    data: (data: object | Array<any>) => void;
    error: (error: Error) => void;
    authenticated: () => void;
}
export type roturUsername = string;
export type roturItemID = string;
export type roturUnixMS = number;
export type hexColourCode = string;
export type timezone = string;
export type md5HashedPassword = string;
export type badge = string;
export type banner_url = string;
export interface transactionObject {
    amount: number;
    note: string;
    time: roturUnixMS;
    type: "in" | "out" | "gamble" | "tax";
    user: roturUsername;
}
export interface themeObject {
    accent: hexColourCode;
    background: hexColourCode;
    primary: hexColourCode;
    secondary: hexColourCode;
    tertiary: hexColourCode;
    text: hexColourCode;
}
export interface AccountObject {
    banner: string;
    bio: string;
    created: roturUnixMS;
    discord_id?: string;
    email?: string;
    hostOS: "Windows" | "Linux" | "MacOS" | "Unknown" | string | null;
    last_login: roturUnixMS;
    max_size: number;
    onboot: Array<string>;
    origin_doc: Array<string>;
    pfp: string;
    private: string | boolean;
    proxy: string;
    "sys.badges": Array<badge>;
    "sys.banners": Array<banner_url>;
    "sys.currency": number;
    "sys.friends": Array<roturUsername>;
    "sys.items": Array<roturItemID>;
    "sys.links": object;
    "sys.purchases": Array<roturItemID>;
    "sys.requests": Array<roturUsername>;
    "sys.roturbotMem": object | Array<any> | string | any;
    "sys.total_logins": number;
    "sys.transactions": Array<transactionObject | string>;
    "sys.used_systems"?: string;
    system: "originOS" | string;
    theme: themeObject;
    timezone: timezone;
    used_size: number;
    username: roturUsername;
    wallpaper: string;
    wallpaper_mode: "Fill" | "Center" | "Fit" | "Stretch" | string;
}
export interface OmailInfo {
    recipient: roturUsername;
    title: string;
    timestamp: roturUnixMS;
    from: roturUsername;
}
export interface Omail {
    body?: string;
    info?: OmailInfo;
}
export declare class RoturClient extends EventEmitter {
    #private;
    RoturSocket: WebSocket;
    constructor();
    private inObj;
    private sendToRotur;
    on<K extends keyof RoturEvents>(event: K, listener: RoturEvents[K]): this;
    once<K extends keyof RoturEvents>(event: K, listener: RoturEvents[K]): this;
    emit<K extends keyof RoturEvents>(event: K, ...args: Parameters<RoturEvents[K]>): boolean;
    sendHandshake(callback?: (success: boolean) => void): Promise<boolean>;
    setID(id: string, callback?: (success: boolean) => void): Promise<boolean>;
    linkToRoom(room: string, callback?: (success: boolean) => void): Promise<boolean>;
    login(username: roturUsername, password: string, callback?: (success: boolean, token?: string) => void): Promise<boolean>;
    loginMD5(username: roturUsername, password: md5HashedPassword, callback?: (success: boolean, token?: string) => void): Promise<boolean>;
    auth(token: string, callback?: (success: boolean) => void): Promise<boolean>;
    getUserData(): Promise<AccountObject>;
    transferCurrency(amount: number, recipient: roturUsername, note?: string): Promise<boolean>;
    sendRmail(recipient: roturUsername, title: string, body: string): Promise<boolean>;
    deleteOmail(index: number | "all"): Promise<boolean>;
    getOmails(): Promise<Array<Omail>>;
    getOmailFromId(id: number): Promise<Omail>;
    getOmailCount(): Promise<number>;
}
