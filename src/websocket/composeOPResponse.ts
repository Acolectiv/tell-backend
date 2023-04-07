import { WsOPCodes } from "../constants";

import IOPResponse from "../interfaces/IOPResponse";

export default function composeOPResponse(op: WsOPCodes, d?: object | null, t?: string) {
    if(!op) return;

    console.log(d)

    if(!d) d = null;
    if(!t) t = null;

    let res = <IOPResponse>{
        op,
        d,
        t
    }

    return JSON.stringify(res);
}