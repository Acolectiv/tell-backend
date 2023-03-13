import { model } from "mongoose";
// @ts-ignore
import jwt from "jsonwebtoken";
// @ts-ignore
import { compare } from "bcrypt";

import IUserPayload from "../interfaces/IUserPayload";
import TellResult from "../typings/TellResult";
import IUser from "../interfaces/IUser";

import removeArrayElementById from "../utils/removeArrayElementById";
import elementExists from "../utils/elementExists";

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

    async fetchTell(tellId: string) {
        if(!tellId) return <TellResult>{ result: "error", msg: "noTellId" };

        let tell = await Tell.findById(tellId).populate("likes").populate("dislikes");
        if(tell) return <TellResult>{ result: "success", tell };
        else return <TellResult>{ result: "error", msg: "noTellFound" };
    }

    async postTell(author: any, text: string) {
        if(!author || !text) return <TellResult>{ result: "error", msg: "noAuthorOrText" };

        let tell = await Tell.create({
            author: author._id,
            text,
            likes: [],
            dislikes: [],
            createdAt: Date.now()
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

    async likeTell(author: any, tellId: string) {
        if(!author || !tellId) return <TellResult>{ result: "error", msg: "noAuthorOrTellId" };

        let tellRes: TellResult = await this.fetchTell(tellId);
        if(tellRes.result == "error") return <TellResult>{ result: "error", msg: tellRes.msg };

        if(elementExists(JSON.parse(JSON.stringify(tellRes.tell.likes)), author._id.toString()) || elementExists(JSON.parse(JSON.stringify(tellRes.tell.dislikes)), author._id.toString()))
            return <TellResult>{ result: "error", msg: "alreadyLikedOrDisliked" };
        else {
            tellRes.tell.likes.push(author._id);

            await tellRes.tell.save();

            return <TellResult>{ result: "success", tell: tellRes.tell };
        }
    }

    async dislikeTell(author: any, tellId: string) {
        if(!author || !tellId) return <TellResult>{ result: "error", msg: "noAuthorOrTellId" };

        let tellRes: TellResult = await this.fetchTell(tellId);
        if(tellRes.result == "error") return <TellResult>{ result: "error", msg: tellRes.msg };

        if(elementExists(JSON.parse(JSON.stringify(tellRes.tell.likes)), author._id.toString()) || elementExists(JSON.parse(JSON.stringify(tellRes.tell.dislikes)), author._id.toString()))
            return <TellResult>{ result: "error", msg: "alreadyLikedOrDisliked" };
        else {
            tellRes.tell.dislikes.push(author._id);

            await tellRes.tell.save();

            return <TellResult>{ result: "success", tell: tellRes.tell };
        }
    }

    async removeLikeOrDislikeTell(author: any, tellId: string) {
        if(!author || !tellId) return <TellResult>{ result: "error", msg: "noAuthorOrTellId" };

        let tellRes: TellResult = await this.fetchTell(tellId);
        if(tellRes.result == "error") return <TellResult>{ result: "error", msg: tellRes.msg };

        let tellsLikes = JSON.parse(JSON.stringify(tellRes.tell.likes));
        let tellsDislikes = JSON.parse(JSON.stringify(tellRes.tell.dislikes));

        if(elementExists(tellsLikes, author._id.toString())) {
            tellRes.tell.likes = removeArrayElementById(tellsLikes, author._id.toString());

            tellRes.tell.save();

            return <TellResult>{ result: "success", tell: tellRes.tell };
        } else if(elementExists(tellsDislikes, author._id.toString())) {
            tellRes.tell.dislikes = removeArrayElementById(tellsDislikes, author._id.toString());

            tellRes.tell.save();

            return <TellResult>{ result: "success", tell: tellRes.tell };
        } else {
            return <TellResult>{ result: "error", msg: "noLike" };
        }
    }
}

export default TellManager;