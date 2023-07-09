import express, { Request, Response } from "express";

import IUserRequest from "../interfaces/IUserRequest";

import NotesManager from "../managers/NotesManager";

export async function createNote(req: IUserRequest, res: Response) {
    try {
        const { text } = req.body;

        if(!text)
            return res.status(401).send({ success: false, error: "noText" });

        const { result, msg, note } = await NotesManager.getInstance().postNote(req.userId, text);
        if(result == "error") return res.status(400).json({ success: false, msg });
        else res.json({ success: true, note });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    }
}

export async function deleteNote(req: IUserRequest, res: Response) {
    try {
        const { noteId } = req.body;

        if(!noteId)
            return res.status(401).send({ success: false, error: "noNoteId" });

        const { result, msg, note } = await NotesManager.getInstance().deleteNote(req.userId, noteId);
        if(result == "error") return res.status(400).json({ success: false, msg });
        else res.json({ success: true, note });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    }
}

export async function fetchNote(req: IUserRequest, res: Response) {
    try {
        const { noteId } = req.params;

        if(!noteId)
            return res.status(401).send({ success: false, error: "noNoteId" });

        const { result, msg, note } = await NotesManager.getInstance().fetchNote(noteId);
        if(result == "error") return res.status(400).json({ success: false, msg });
        else res.json({ success: true, note });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    }
}

export async function editNote(req: IUserRequest, res: Response) {
    try {
        const { noteId, text } = req.body;

        if(!noteId || !text)
            return res.status(401).send({ success: false, error: "noNoteIdOrText" });

        const { result, msg, note } = await NotesManager.getInstance().editNote(req.userId, noteId, text);
        if(result == "error") return res.status(400).json({ success: false, msg });
        else res.json({ success: true, note });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    }
}