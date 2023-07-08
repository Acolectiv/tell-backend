import { getStreams } from "../config/bunyan";

import bunyan from "bunyan";

class MessageIndexer {
    private privateMessages: Map < string, any > ;
    private groupMessages: Map < string, any > ;
    private senderReceiverCapacity: Map < string, number > ;

    private maxCapacityPerSenderReceiver: number = 256;

    public logger: bunyan;

    constructor() {
        this.privateMessages = new Map < string, any > ();
        this.groupMessages = new Map < string, any > ();
        this.senderReceiverCapacity = new Map < string, number > ();

        this.logger = bunyan.createLogger({ name: "MessageIndexer", streams: getStreams() });

        this.logger.info({ event: 'MessageIndexer' }, '[MessageIndexer] Started indexing new messages.');
    }

    public indexPrivateMessage(privateMessage: {
        message: string,
        senderId: string,
        receiverId: string,
        messageId: string
    }): void {
        const {
            senderId,
            receiverId,
            messageId
        } = privateMessage;

        const senderKey = this.generatePrivateMessageKey(senderId, receiverId);
        const receiverKey = this.generatePrivateMessageKey(receiverId, senderId);

        if(this.senderReceiverCapacity.get(senderKey) >= this.maxCapacityPerSenderReceiver ||
           this.senderReceiverCapacity.get(receiverKey) >= this.maxCapacityPerSenderReceiver) {
            const evictedMessage = Array.from(this.privateMessages.get(senderKey).values().first()) as any;
            this.removePrivateMessage(senderId, receiverId, evictedMessage.messageId);
        }

        const senderMessages = this.privateMessages.get(senderKey) || [];
        senderMessages.push(privateMessage);
        this.privateMessages.set(senderKey, senderMessages);

        const receiverMessages = this.privateMessages.get(receiverKey) || [];
        receiverMessages.push(privateMessage);
        this.privateMessages.set(receiverKey, receiverMessages);

        if(!this.senderReceiverCapacity.get(senderKey) && !this.senderReceiverCapacity.get(receiverKey)) {
            this.senderReceiverCapacity.set(senderKey, 1);
            this.senderReceiverCapacity.set(receiverKey, 1);
        } else {
            this.senderReceiverCapacity.set(senderKey, this.senderReceiverCapacity.get(senderKey) + 1);
            this.senderReceiverCapacity.set(receiverKey, this.senderReceiverCapacity.get(receiverKey) + 1);
        }

        this.logger.info({ event: 'indexPrivateMessage' }, `private message ${messageId} indexed`);
    }

    public indexGroupMessage(groupMessage: {
        groupId: string,
        message: string,
        sentBy: string,
        messageId: string
    }): void {
        if (!this.groupMessages.has(groupMessage.groupId)) this.groupMessages.set(groupMessage.groupId, []);

        const messages = this.groupMessages.get(groupMessage.groupId);
        messages.push(groupMessage);
        this.groupMessages.set(groupMessage.groupId, messages);

        this.logger.info({ event: 'indexGroupMessage' }, `group message ${groupMessage.messageId} indexed`);
    }

    public getPrivateMessages(privateMessage: {
        sender: string,
        receiver: string
    }): Array < any > {
        const key = this.generatePrivateMessageKey(privateMessage.sender, privateMessage.receiver);

        if (this.privateMessages.has(key)) return this.privateMessages.get(key);

        return [];
    }

    public getGroupMessages(groupId: string): Array < any > {
        if (this.groupMessages.has(groupId)) {
            return this.groupMessages.get(groupId);
        }
        return [];
    }

    public clearPrivateMessages(sender: string, receiver: string): void {
        const key = this.generatePrivateMessageKey(sender, receiver);
        if (this.privateMessages.has(key)) {
            this.privateMessages.delete(key);
        }
    }

    public clearGroupMessages(groupId: string): void {
        if (this.groupMessages.has(groupId)) {
            this.groupMessages.delete(groupId);
        }
    }

    public getAllPrivateMessages(): any {
        const messages: any = [];
        for (const messagesList of Array.from(this.privateMessages.values())) {
            messages.push(...messagesList);
        }
        return messages;
    }

    public getAllGroupMessages(): any {
        const messages: any = [];
        for (const messagesList of Array.from(this.groupMessages.values())) {
            messages.push(...messagesList);
        }
        return messages;
    }

    public countPrivateMessages(): number {
        let count = 0;
        for (const messagesList of Array.from(this.privateMessages.values())) {
            count += messagesList.length;
        }
        return count;
    }

    public countGroupMessages(): number {
        let count = 0;
        for (const messagesList of Array.from(this.groupMessages.values())) {
            count += messagesList.length;
        }
        return count;
    }

    public searchPrivateMessages(
        sender: string,
        receiver: string,
        query: string
    ): any {
        const key = this.generatePrivateMessageKey(sender, receiver);
        if (this.privateMessages.has(key)) {
            const messages = this.privateMessages.get(key);
            return messages.filter((message: any) =>
                message.message.toLowerCase().includes(query.toLowerCase())
            );
        }
        return [];
    }

    public searchGroupMessages(groupId: string, query: string): any {
        if (this.groupMessages.has(groupId)) {
            const messages = this.groupMessages.get(groupId);
            return messages.filter((message: any) =>
                message.message.toLowerCase().includes(query.toLowerCase())
            );
        }
        return [];
    }

    public getMostActiveUsers(): {
        userId: string;messageCount: number
    } [] {
        const userActivityMap: Map < string, number > = new Map();

        for (const messagesList of Array.from(this.privateMessages.values())) {
            for (const message of messagesList) {
                const {
                    sender,
                    receiver
                } = message;
                const key1 = this.generatePrivateMessageKey(sender, receiver);
                const key2 = this.generatePrivateMessageKey(receiver, sender);

                if (userActivityMap.has(key1)) {
                    userActivityMap.set(key1, userActivityMap.get(key1) !+1);
                } else if (userActivityMap.has(key2)) {
                    userActivityMap.set(key2, userActivityMap.get(key2) !+1);
                } else {
                    userActivityMap.set(key1, 1);
                }
            }
        }

        const mostActiveUsers: {
            userId: string;messageCount: number
        } [] = [];
        for (const [userId, messageCount] of Array.from(userActivityMap.entries())) {
            mostActiveUsers.push({
                userId,
                messageCount
            });
        }

        mostActiveUsers.sort((a, b) => b.messageCount - a.messageCount);

        return mostActiveUsers;
    }

    private removeGroupMessage(groupId: string, messageId: string): void {
        const messages = this.groupMessages.get(groupId) || [];
        const updatedMessages = messages.filter((msg: any) => msg.messageId !== messageId);
        this.groupMessages.set(groupId, updatedMessages);
    }

    private removePrivateMessage(senderId: string, receiverId: string, messageId: string): void {
        const senderKey = this.generatePrivateMessageKey(senderId, receiverId);
        const receiverKey = this.generatePrivateMessageKey(receiverId, senderId);

        const senderMessages = this.privateMessages.get(senderKey) || [];
        const updatedSenderMessages = senderMessages.filter((msg: any) => msg.messageId.toString() !== messageId);
        this.privateMessages.set(senderKey, updatedSenderMessages);

        const receiverMessages = this.privateMessages.get(receiverKey) || [];
        const updatedReceiverMessages = receiverMessages.filter((msg: any) => msg.messageId.toString() !== messageId);
        this.privateMessages.set(receiverKey, updatedReceiverMessages);
    }

    private generatePrivateMessageKey(sender: string, receiver: string): string {
        return `${sender}_${receiver}`;
    }

    private getMessageById(messageId: string): any {
        const privateMessages = Array.from(this.privateMessages.values());
        const message = privateMessages.find((message: any) => message.messageId.toString() === messageId);

        return message;
    }
}

export default MessageIndexer;