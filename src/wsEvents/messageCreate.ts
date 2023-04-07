import MessageCenter from "../modules/Messages/MessageCenter";

import composeOPResponse from "../websocket/composeOPResponse";
import { WsOPCodes } from "../constants";
import { ClientRequest } from "http";

export default async function messageCreate(client: any, d: any) {
    try {
        if(!d || !d.author || !d.text || !d.gcId)
            return client.send(composeOPResponse(WsOPCodes["ERROR"]));

        let { result, message } = await MessageCenter.getInstance().postMessage(d.gcId, {
            text: d.text,
            author: d.author
        });

        if(result == "error") return client.send(composeOPResponse(WsOPCodes["ERROR"]));
        else {
            client.send(JSON.stringify({
                op: 11,
                d: {
                    text: d.text, author: d.author
                }
            }));
        }
    } catch(e) {
        console.log(e);
    }
}