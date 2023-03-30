import { WebSocketServer } from 'ws';

import jwt from "jsonwebtoken";

class SocketManager {
    private static ws: WebSocketServer;
    private static clients: Map<any, any> = new Map(); 

    constructor() {}

    createServer() {
        if(SocketManager.ws) return;
        else {
            SocketManager.ws = new WebSocketServer({
                port: 8080,
                perMessageDeflate: {
                    zlibDeflateOptions: {
                        chunkSize: 1024,
                        memLevel: 7,
                        level: 3
                    },
                    zlibInflateOptions: {
                        chunkSize: 10 * 1024
                    },
                    clientNoContextTakeover: true,
                    serverNoContextTakeover: true,
                    serverMaxWindowBits: 10,
                    concurrencyLimit: 10,
                    threshold: 1024
                },
                verifyClient: function(info, cb) {
                    let token = info.req.headers.token as string;
            
                    if(!token) cb(false, 401, "Unauthorized");
                    else {
                        jwt.verify(token, process.env.JWT_TOKEN, function(err, decoded) {
                            if(err) cb(false, 401, "Unauthorized");
                            else {
                                Object.assign(info.req, { user: decoded });
                                cb(true);
                            }
                        })
                    }
                }
            });

            this._listenToEvents();
        }
    }

    _listenToEvents() {
        if(!SocketManager.ws) return;

        SocketManager.ws.on('connection', function connection(conn, wss) {
            SocketManager.ws.on('error', console.error);
        
            // @ts-ignore
            let user = wss.user;
        
            SocketManager.clients.set(user.userId, conn);
        });
    }

    sendToClient(clientId: string, data: object) {
        if(!SocketManager.ws) return;

        try {
            let client = SocketManager.clients.get(clientId);
            client.send(JSON.stringify(data || null));
        } catch(e) {
            return "error";
        }
    }
}

export default SocketManager;