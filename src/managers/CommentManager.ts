import { model } from "mongoose";
import removeElementById from "../utils/removeElemntById";

const Comment = model("Comment");
const Tell = model("Tell");

import CommentResult from "../typings/CommentResult";

import TellManager from "./TellManager";
import elementExists from "../utils/elementExists";
import removeArrayElementById from "../utils/removeArrayElementById";

class CommentManager {
    private static instance: CommentManager;

    private constructor() {
        console.log(`[CommentManager] -> CommentManager initialized.`);
    }

    public static getInstance(): CommentManager {
        if(!CommentManager.instance) {
            CommentManager.instance = new CommentManager();
        }

        return CommentManager.instance;
    }

    async fetchComment(commentId: string) {
        let comment = await Comment.findById(commentId).populate("likes").populate("dislikes");
        if(comment === null) return <CommentResult>{ result: "error", msg: "noComment" };
        else return <CommentResult>{ result: "success", comment };
    }

    async fetchComments(tellId: string, limit: number) {
        let tell = await Tell.findById({ _id: tellId }).limit(limit).populate("comments");

        return tell.comments;
    }

    async postComment(tellId: string, payload: any) {
        let tellRes = await TellManager.getInstance().fetchTell(tellId);
        if(tellRes.result == "error") return <CommentResult>{ result: "error", msg: "noTell" };

        if(!payload) return <CommentResult>{ result: "error", msg: "noPayload" };

        let comment = await Comment.create({
            author: payload.author,
            parent: tellId,
            text: payload.text,
            createdAt: Date.now(),
            likes: [],
            dislikes: []
        });

        tellRes.tell.comments.push(comment._id);
        await tellRes.tell.save();

        return <CommentResult>{ result: "success", comment };
    }

    async deleteComment(deleter: string, commentId: string) {
        if(!deleter || !commentId) return <CommentResult>{ result: "error", msg: "noDeleterOrCommentId" };

        let commentRes: CommentResult = await this.fetchComment(commentId);
        if(commentRes.result == "error") return <CommentResult>{ result: "error", msg: commentRes.msg };

        let tellRes = await TellManager.getInstance().fetchTell(commentRes.comment.parent);
        if(tellRes.result == "error") return <CommentResult>{ result: "error", msg: "noTell" };

        if(commentRes.comment.author.toString() != deleter) return <CommentResult>{ result: "error", msg: "noPermission" };

        await Comment.deleteOne({ _id: commentId });
        tellRes.tell.comments = removeElementById(JSON.parse(JSON.stringify(tellRes.tell.comments)), commentId);
        await tellRes.tell.save();

        return <CommentResult>{ result: "success", comments: tellRes.tell.comments };
    }

    async likeComment(userId: string, commentId: string) {
        if(!userId || !commentId) return <CommentResult>{ result: "error", msg: "noUserIdorCommentId" };

        let commentRes: CommentResult = await this.fetchComment(commentId);
        if(commentRes.result == "error") return <CommentResult>{ result: "error", msg: commentRes.msg };

        let likesParsed = JSON.parse(JSON.stringify(commentRes.comment.likes));
        let dislikesParsed = JSON.parse(JSON.stringify(commentRes.comment.dislikes));

        if(elementExists(likesParsed, userId) || elementExists(dislikesParsed, userId))
            return <CommentResult>{ result: "error", msg: "alreadyLikedOrDisliked" };
        else {
            commentRes.comment.likes.push(userId);

            //await commentRes.comment.save();

            return <CommentResult>{ result: "success", comment: commentRes.comment };
        }
    }

    async dislikeComment(userId: any, commentId: string) {
        if(!userId || !commentId) return <CommentResult>{ result: "error", msg: "noUserIdOrCommentId" };

        let commentRes: CommentResult = await this.fetchComment(commentId);
        if(commentRes.result == "error") return <CommentResult>{ result: "error", msg: commentRes.msg };

        let likesParsed = JSON.parse(JSON.stringify(commentRes.comment.likes));
        let dislikesParsed = JSON.parse(JSON.stringify(commentRes.comment.dislikes));

        if(elementExists(likesParsed, userId) || elementExists(dislikesParsed, userId))
            return <CommentResult>{ result: "error", msg: "alreadyLikedOrDisliked" };
        else {
            commentRes.comment.dislikes.push(userId);

            await commentRes.comment.save();

            return <CommentResult>{ result: "success", comment: commentRes.comment };
        }
    }

    async removeLikeOrDislikeComment(userId: any, commentId: string) {
        if(!userId || !commentId) return <CommentResult>{ result: "error", msg: "noUserIdOrCommentId" };

        let commentRes: CommentResult = await this.fetchComment(commentId);
        if(commentRes.result == "error") return <CommentResult>{ result: "error", msg: commentRes.msg };

        let likesParsed = JSON.parse(JSON.stringify(commentRes.comment.likes));
        let dislikesParsed = JSON.parse(JSON.stringify(commentRes.comment.dislikes));

        if(elementExists(likesParsed, userId)) {
            commentRes.comment.likes = removeArrayElementById(likesParsed, userId);

            commentRes.comment.save();

            return <CommentResult>{ result: "success", comment: commentRes.comment };
        } else if(elementExists(dislikesParsed, userId)) {
            commentRes.comment.dislikes = removeArrayElementById(dislikesParsed, userId);

            commentRes.comment.save();

            return <CommentResult>{ result: "success", comment: commentRes.comment };
        } else {
            return <CommentResult>{ result: "error", msg: "noLikeOrDislike" };
        }
    }
}

export default CommentManager;