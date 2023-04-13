import config from "./constants";

import { model } from "mongoose";
const Tell = model("Tell");
const User = model("User");

// @ts-ignore
import LDA from "lda-topic-model";

class Algorithm { 
    private static instance: Algorithm;

    private constructor() {
        console.log(`[Algorithm] -> Algorithm initialized.`);
    }

    public static getInstance(): Algorithm {
        if(!Algorithm.instance) {
            Algorithm.instance = new Algorithm();
        }

        return Algorithm.instance;
    }

    async fetchTells() {
        let tells = await Tell.aggregate([{ $sample: { size: 30 } }]).exec();

        return { result: "success", tells }
    }

    getTopic(text: string): string {
        const options = {
            displayingStopwords: false,
            language: 'en',
            numberTopics: 1,
            sweeps: 100,
            stem: true,
        };

        const document = [{
            id: 0,
            text
        }]

        const lda = new LDA(options, document);
        const topics = lda.getTopicWords();

        return topics[0].topicText;
    }

    async assignInterestsToUsers(userId: string): Promise<void> {
        const user = await User.findById(userId);
        const tells = await Tell.find({ likes: user._id }).populate("likes");

        const topicTextArray = tells.map((tell: any) => tell.topicText);

        console.log(this.calculateInterests(topicTextArray));
    }

    calculateInterests(topicTextArray: Array<any>): Array<any> {
        try {
            const documents = topicTextArray.map(topicText => topicText.split(" "));

            const options = {
                displayingStopwords: false,
                language: 'en',
                numberTopics: 1,
                sweeps: 100,
                stem: true,
            };

            let document: Array<any> = [];

            documents.forEach((doc) => document.push({
                text: doc
            }));

            const lda = new LDA(options, document)

            const result = lda.getTopicWords();

            return result.map((topic: any) => topic.topicText)
        } catch(e) {
            console.log(e)
        }
    }
}

export default Algorithm;