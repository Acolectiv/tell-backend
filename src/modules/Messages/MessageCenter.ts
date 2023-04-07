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

    async fetchUserGCs(filter: any): Promise<any> {
        let gcs = await GC.find(filter);

        if(gcs === null) return { result: "error", msg: "noGCs" };
        else return { result: "success", gcs };
    }

    async createGC(payload: any) {
        if(!payload || !payload.author || payload.gcType != 0)
            return { result: "error", msg: "payloadIncomplete" };

        let type: number = payload.gcType;
        let members: Array<string> | string | null | undefined = payload.members;
        let author: string = payload.author;

        if(type == 0 && (Array.isArray(members) || members === (null || undefined))) {
            return { result: "error", msg: "incorrectMembersType" };
        } else {
            if(payload.author == payload.members)
                return { result: "error", msg: "authorInMembers" };

            let { result, msg, gcs } = await this.fetchUserGCs({ author });

            try {
                let exsGC = null;

                gcs.map((g: any) => {
                    if(g.gcType == 0 && g.members.includes(members)) {
                        exsGC = g;
                    }
                });

                if(exsGC) return { result: "success", gc: exsGC };
                else {
                    let newGC = await GC.create({
                        author,
                        members,
                        gcType: type,
                        name: payload.members.toString()
                    });
    
                    return { result: "success", gc: newGC };
                }
            } catch (e) { console.log(e) }
        }
    }

    async postMessage(gcId: string, payload: any) {
        let { result, msg, gc } = await this.fetchGC({ _id: gcId });

        if(!payload || !payload.text || !payload.author)
            return { result: "error", msg: "payloadIncomplete" };

        let obj = {
            text: payload.text,
            sentBy: payload.author,
            createdAt: Date.now()
        };

        console.log(gc.messages)

        gc.messages.push(obj);
        gc.lastMessage = {
            message: obj.text,
            createdAt: obj.createdAt
        };

        await gc.save();

        return { result: "success", message: obj };
    }
}

export default MessageCenter;