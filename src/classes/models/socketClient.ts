import * as WebSocketServer from 'ws';
import SocketIO = require('socket.io');

export class SocketClient implements SocketIO.Socket {
    nsp: SocketIO.Namespace;
    server: SocketIO.Server;
    adapter: SocketIO.Adapter;
    id: string;
    request: any;
    client: SocketIO.Client;
    conn: SocketIO.EngineSocket;
    rooms: { [id: string]: string; };
    connected: boolean;
    disconnected: boolean;
    handshake: SocketIO.Handshake;
    json: SocketIO.Socket;
    volatile: SocketIO.Socket;
    broadcast: SocketIO.Socket;


    clientId: string;
    isAlive?: boolean;

    to(room: string): SocketIO.Socket {
        throw new Error("Method not implemented.");
    }
    in(room: string): SocketIO.Socket {
        throw new Error("Method not implemented.");
    }
    use(fn: (packet: SocketIO.Packet, next: (err?: any) => void) => void): SocketIO.Socket {
        throw new Error("Method not implemented.");
    }
    send(...args: any[]): SocketIO.Socket {
        throw new Error("Method not implemented.");
    }
    write(...args: any[]): SocketIO.Socket {
        throw new Error("Method not implemented.");
    }
    join(name: string | string[], fn?: (err?: any) => void): SocketIO.Socket {
        throw new Error("Method not implemented.");
    }
    leave(name: string, fn?: Function): SocketIO.Socket {
        throw new Error("Method not implemented.");
    }
    leaveAll(): void {
        throw new Error("Method not implemented.");
    }
    disconnect(close?: boolean): SocketIO.Socket {
        throw new Error("Method not implemented.");
    }
    listeners(event: string): Function[] {
        throw new Error("Method not implemented.");
    }
    compress(compress: boolean): SocketIO.Socket {
        throw new Error("Method not implemented.");
    }
    addListener(event: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error("Method not implemented.");
    }
    on(event: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error("Method not implemented.");
    }
    once(event: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error("Method not implemented.");
    }
    removeListener(event: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error("Method not implemented.");
    }
    removeAllListeners(event?: string | symbol): this {
        throw new Error("Method not implemented.");
    }
    setMaxListeners(n: number): this {
        throw new Error("Method not implemented.");
    }
    getMaxListeners(): number {
        throw new Error("Method not implemented.");
    }
    emit(event: string | symbol, ...args: any[]): boolean {
        throw new Error("Method not implemented.");
    }
    listenerCount(type: string | symbol): number {
        throw new Error("Method not implemented.");
    }
    prependListener(event: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error("Method not implemented.");
    }
    prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error("Method not implemented.");
    }
    eventNames(): (string | symbol)[] {
        throw new Error("Method not implemented.");
    }
}
