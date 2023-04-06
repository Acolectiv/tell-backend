import { model } from "mongoose";

const GC = model("GroupChat");

class MessageCenter {
    private static instance: MessageCenter;

    private constructor() {
        console.log(`[MessageCenter] -> MessageCenter initialized.`);
    }

    public static getInstance(): MessageCenter {
        if(!MessageCenter.instance) {
            MessageCenter.instance = new MessageCenter();
        }

        return MessageCenter.instance;
    }

    async fetchGC(filter: any): Promise<any> {
        let gc = await GC.findOne(filter);

        if(gc === null) return { result: "error", msg: "noGC" };
        else return { result: "success", gc };
    }

    async createGC(payload: any) {
        if(!payload || !payload.author || !payload.gcType)
            return { result: "error", msg: "payloadIncomplete" };

        let type: number = payload.gcType;
        let members: Array<string> | string | null | undefined = payload.members;
        let author: string = payload.author;

        if(type == 0 && (Array.isArray(members) || members === (null || undefined))) {
            return { result: "error", msg: "incorrectMembersType" };
        } else {
            let { result, msg, gc } = await this.fetchGC({ author, members: { $elemMatch: payload.members } });
            if(result == "error") return { result: "error", msg };

            if(gc) return { result: "success", gc };
            else {
                let newGC = await GC.create({
                    author,
                    members,
                    gcType: type,
                    name: payload.members.toString()
                });

                return { result: "success", gc: newGC };
            }
        }
    }
}

export default MessageCenter;