import { WsOPCodes } from "../constants";

import IOPResponse from "../interfaces/IOPResponse";

const composeOPResponse = (op: WsOPCodes, d?: string | null, t?: string | null) => {
    if(!op) return;

    if(!d) d = null;
    if(!t) t = null;

    let res = <IOPResponse>{
        op,
        d,
        t
    }

    return JSON.stringify(res);
}

export default composeOPResponse;