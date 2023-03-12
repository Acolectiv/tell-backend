import { model } from "mongoose";
// @ts-ignore
import jwt from "jsonwebtoken";
// @ts-ignore
import { compare } from "bcrypt";

import IUserPayload from "../interfaces/IUserPayload";
import TellResult from "../typings/TellResult";
import IUser from "../interfaces/IUser";
import removeArrayElementById from "../utils/removeArrayElementById";

const User = model("User");
const Tell = model("Tell");

class TellManager {
    private static instance: TellManager;

    private constructor() {
        console.log(`[TellManager] -> TellManager initialized.`);
    }

    public static getInstance(): TellManager {
        if(!TellManager.instance) {
            TellManager.instance = new TellManager();
        }

        return TellManager.instance;
    }

    async postTell(author: any, text: string) {
        if(!author || !text) return <TellResult>{ result: "error", msg: "noAuthorOrText" };

        let tell = await Tell.create({
            author: author._id,
            text,
            likes: 0,
            dislikes: 0
        });

        author.tells.push(tell._id);
        await author.save();

        return <TellResult>{ result: "success", tell };
    }

    async deleteTell(author: any, tellId: string) {
        if(!author || !tellId) return <TellResult>{ result: "error", msg: "noAuthorOrTellId" };

        await Tell.deleteOne({ _id: tellId });
        author.tells = removeArrayElementById(author.tells, tellId);
        await author.save();

        return <TellResult>{ result: "success", tell: author.tells };
    }
}

export default TellManager;