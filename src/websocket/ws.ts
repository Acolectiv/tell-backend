import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3001 });

wss.on('connection', function conn(ws) {
    ws.on('error', console.log);

    ws.on('message', function msg(data, isBinary) {
        wss.clients.forEach(function each(client) {
            if(client.readyState === WebSocket.OPEN) {
                client.send(data, { binary: isBinary });
            }
        })
    })
})