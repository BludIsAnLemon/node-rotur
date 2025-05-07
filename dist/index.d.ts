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
    "data": (data: object | Array<any>) => void;
    "error": (error: Error) => void;
    "authenticated": () => void;
}
export declare class RoturClient extends EventEmitter {
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
    login(username: string, password: string, callback?: (success: boolean, token?: string) => void): Promise<boolean>;
    loginMD5(username: string, password: string, callback?: (success: boolean, token?: string) => void): Promise<boolean>;
    auth(token: string, callback?: (success: boolean) => void): Promise<boolean>;
}
