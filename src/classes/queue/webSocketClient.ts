import * as WebSocketServer from 'ws';

export class WebSocketClient extends WebSocketServer {
    remoteAddress: string;
    remotePort: number;
    clientId: string;
    isAlive?: boolean;
}
