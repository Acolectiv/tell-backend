import { WebSocketServer } from 'ws';

import jwt from "jsonwebtoken";

import { WsOPCodes } from '../constants';

import ws from "../config/ws";
import composeOPResponse from './composeOPResponse';

import messageCreate from '../wsEvents/messageCreate';

class SocketManager {
    private static ws: WebSocketServer;
    private static clients: Map<any, any> = new Map(); 

    constructor() {}

    createServer() {
        if(SocketManager.ws) return;
        else {
            SocketManager.ws = new WebSocketServer({
                ...ws,
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

        SocketManager.ws.on('connection', (conn, wss) => {
            SocketManager.ws.on('error', () => {
                conn.send(composeOPResponse(WsOPCodes["ERROR"]));
            });
        
            // @ts-ignore
            let user = wss.user;
        
            conn.send(composeOPResponse(WsOPCodes["OK"]));

            SocketManager.clients.set(user.userId, conn);

            conn.on('message', (d: any) => {
                let parsed = JSON.parse(d.toString());
                if(parsed.op == 12) messageCreate(parsed.d);
            });

            //this.registerEvents();
        });
    }

    getWS() {
        return ws;
    }

    registerEvents() {
        require("../wsEvents");
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