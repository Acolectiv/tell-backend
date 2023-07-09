import { Socket, Server } from "socket.io";

import {
    model
} from "mongoose";

const User = model("User");
const Message = model("Message");
const PrivateMessage = model("PrivateMessage");
const Group = model("Group");

import MessageIndexer from "../indexers/MessageIndexer";

import logger from "../utils/logger";

class MessageHandler {
    public io: Server;
    public messageIndexer: MessageIndexer;

    constructor(server: Server) {
        this.io = server;
        this.messageIndexer = new MessageIndexer();

        logger.debug({ event: 'MessageHandler' }, '[SocketIOHandler] MessageHandler initialized.');
    }

    public async storeMessage(
        sender: string,
        receiver: string,
        message: string,
        roomId ? : string,
        reactions: Array < string > = [],
        replyTo?: string
    ): Promise < void > {
        try {
            if (roomId) {
                const group = await Group.findById(roomId);

                if (!group) {
                    console.log(`Group not found with _id: ${roomId}`);
                    return;
                }

                const newMessage = await Message.create({
                    sender,
                    message,
                    reactions,
                    replyTo: replyTo || null,
                    lastAccesedAt: Date.now()
                });

                this.messageIndexer.indexGroupMessage({
                    groupId: roomId,
                    message,
                    sentBy: sender,
                    messageId: newMessage._id
                })

                group.messages.push(newMessage);
                await group.save();
                logger.debug({ event: 'storeMessage' }, 'message stored in the database and added to the group');
            } else {
                const newMessage = await PrivateMessage.create({
                    sender,
                    receiver,
                    message,
                    reactions,
                    replyTo: replyTo || null,
                    lastAccesedAt: Date.now()
                });

                this.messageIndexer.indexPrivateMessage({
                    message,
                    senderId: sender,
                    receiverId: receiver,
                    messageId: newMessage._id
                });

                logger.debug({ event: 'storeMessage' }, 'private message stored in the database');
            }
        } catch (error) {
            logger.error('Error storing message in the database:', error);
        }
    }

    public handleMessage(socket: Socket): void {
        socket.on('message', async (data: {
            userId: string,
            message: string,
            room ? : string,
            reactions: Array < string > | [],
            replyTo?: string | null
        }) => {
            const {
                userId,
                message,
                room,
                reactions,
                replyTo
            } = data;

            const user = await User.findById(userId);

            if (!user || user._id.toString() !== userId) {
                console.log(`User not found or unauthorized with socket ID: ${socket.id}`);
                return;
            }

            if (room) {
                socket.to(room).emit('message', {
                    sender: user.username,
                    message,
                    room,
                    reactions,
                    replyTo: replyTo || null
                });

                await this.storeMessage(user._id, null, message, room, reactions, replyTo);

                logger.debug({ event: 'handleMessage' }, `Message sent to room: ${room}`);
            } else {
                socket.broadcast.emit('message', {
                    sender: user.username,
                    message,
                    reactions,
                    replyTo: replyTo || null
                });
                logger.debug({ event: 'handleMessage' }, 'Message broadcasted to all connected clients');
            }
        });
    }

    public handlePrivateMessage(socket: Socket): void {
        socket.on('privateMessage', async (data: {
            receiverId: string,
            message: string,
            reactions?: Array < string > | [],
            replyTo?: string | null
        }) => {
            const {
                receiverId,
                message,
                reactions,
                replyTo
            } = data;

            let senderId = (socket as any).userId;

            const sender = await User.findById(senderId);

            if (!sender) {
                logger.debug({ event: 'privateMessage' }, `sender not found with _id: ${senderId}`);
                return;
            }

            const receiver = await User.findById(receiverId);

            if (!receiver) {
                logger.debug({ event: 'privateMessage' }, `receiver not found with _id: ${receiverId}`);
                return;
            }

            await this.storeMessage(sender._id, receiver._id, message, null, reactions, replyTo);

            if (receiver.socketId) {
                this.io.to(receiver.socketId).emit('privateMessage', {
                    senderId: sender._id,
                    senderUsername: sender.username,
                    message,
                    reactions
                });
                logger.debug({ event: 'privateMessage' }, `private message sent, reply to ${replyTo || null}`);
            } else {
                logger.debug({ event: 'privateMessage' }, 'receiver is currently offline');
            }
        });
    }

    public handleGroupMessage(socket: Socket): void {
        socket.on('groupMessage', async (data: {
            message: string,
            groupId: string,
            reactions: Array < string > | []
        }) => {
            const {
                groupId,
                message,
                reactions
            } = data;

            if(!groupId || !message) {
                logger.debug({ event: 'groupMessage' }, `groupId not found with _id: ${groupId || null}`);
                return;
            }

            const group = await Group.findById(groupId);

            const senderId = (socket as any).userId;

            if(!group) {
                logger.debug({ event: 'groupMessage' }, `group not found with _id: ${groupId || null}`);
                return;
            }

            if(!this.isGroupMember(group, (socket as any).userId) && !this.isGroupOwner(group, (socket as any).userId))
                return socket.emit('invalidPermission');

            let mentions = await this.parseMentions(message);

            const newMessage = await Message.create({
                sender: senderId,
                message,
                reactions,
                mentions
            });

            this.messageIndexer.indexGroupMessage({
                groupId: groupId,
                message,
                sentBy: senderId,
                messageId: newMessage._id,
            })

            this.io.to(groupId).emit('newGroupMessage', {
                groupId,
                senderId,
                message,
                messageId: newMessage._id,
                mentions
            });

            group.messages.push(newMessage);
            await group.save();
            logger.debug({ event: 'groupMessage' }, `stored & indexed, mentions: ${mentions.join(", ")}.`);
        });
    }

    public fetchMessagesBetweenUsers(socket: Socket): void {
        socket.on('fetchMessagesBetweenUsers', async (data: {
            senderId: string,
            receiverId: string
        }) => {
            const {
                senderId,
                receiverId
            } = data;

            if(!senderId || !receiverId) {
                logger.debug({ event: 'fetchMessagesBetweenUsers' }, `pms not found with sender ${senderId} and receiver ${receiverId}`);
                return;
            }

            const messages = await PrivateMessage.find({
                $or: [{
                        senderId,
                        receiverId
                    },
                    {
                        senderId: receiverId,
                        receiverId: senderId
                    },
                ],
            }).sort({
                createdAt: 1
            });

            return messages;
        });
    }

    public handleTyping(socket: Socket): void {
        socket.on('typing', (room: string) => {
            socket.to(room).emit('typing', socket.id);
            logger.debug({ event: 'typing' }, `User with socket ID ${socket.id} is typing in room: ${room}`);
        });

        socket.on('stopTyping', (room: string) => {
            socket.to(room).emit('stopTyping', socket.id);
            logger.debug({ event: 'stopTyping' }, `User with socket ID ${socket.id} stopped typing in room: ${room}`);
        });
    }

    public handleDeleteMessage(socket: Socket): void {
        socket.on("deleteMessage", async (data: {
            messageId: string
        }) => {
            const {
                messageId
            } = data;

            if(!messageId) {
                logger.debug({ event: 'deleteMessage' }, `message not found with _id ${messageId || null}`);
                return;
            }

            try {
                const message = await PrivateMessage.findByIdAndRemove(messageId).exec();
                if (message) {
                    socket.emit("messageDeleted", messageId);
                    logger.debug({ event: 'deleteMessage' }, `Message with ID ${messageId} deleted`);
                } else {
                    logger.debug({ event: 'deleteMessage' }, `Message with ID ${messageId} not found`);
                }
            } catch (error) {
                logger.error(`Error deleting message with ID ${messageId}:`, error);
            }
        });
    }

    public handleSeenMessage(socket: Socket): void {
        socket.on("seenMessage", async (data: {
            messageId: string;
            receiverId: string;
        }) => {
            const {
                messageId,
                receiverId
            } = data;

            if(!messageId || !receiverId) {
                logger.debug({ event: 'seenMessage' }, `message not found with _id ${messageId || null} or receiver not found with _id ${receiverId || null}`);
                return;
            }

            try {
                const message = await PrivateMessage.findByIdAndUpdate(
                    messageId, {
                        seen: true
                    }, {
                        new: true
                    }
                ).exec();

                if (message) {
                    if (!message.seenBy.includes(receiverId)) {
                        message.seenBy.push(receiverId);
                        await message.save();
                    }
                    socket.emit("messageSeen", messageId);
                    logger.debug({ event: 'seenMessage' }, `Message with ID ${messageId} marked as seen`);
                } else {
                    logger.debug({ event: 'seenMessage' }, `Message with ID ${messageId} not found`);
                }
            } catch (error) {
                logger.error(`Error marking message with ID ${messageId} as seen:`, error);
            }
        });
    }

    public updateMessageContent(socket: Socket): void {
        socket.on("updateMessageContent", async (data: {
            messageId: string;
            newMessageContent: string;
        }) => {
            const {
                messageId,
                newMessageContent
            } = data;

            if(!messageId || !newMessageContent) {
                logger.debug({ event: 'updateMessageContent' }, `message not found with _id ${messageId || null} or newMessageContent not available`);
                return;
            }

            try {
                const message = await Message.findByIdAndUpdate(messageId, {
                    message: newMessageContent
                }, {
                    new: true
                }).exec();

                if (message) {
                    logger.debug({ event: 'updateMessageContent' }, `Message with ID ${messageId} content updated to: ${newMessageContent}`);
                } else {
                    logger.debug({ event: 'updateMessageContent' }, `Message with ID ${messageId} not found`);
                }
            } catch (error) {
                logger.error(`Error updating message with ID ${messageId} content:`, error);
            }
        })
    }

    public getUnreadMessageCount(socket: Socket): void {
        socket.on("getUnreadMessageCount", async (data: {
            receiverId: string;
        }) => {
            const {
                receiverId
            } = data;

            if(!receiverId) {
                logger.debug({ event: 'getUnreadMessageCount' }, `receiver with _id ${receiverId || null} not found`);
                return;
            }

            try {
                const count = await Message.countDocuments({
                    receiver: receiverId,
                    seenBy: {
                        $ne: receiverId
                    }
                }).exec();
                return count;
            } catch (error) {
                logger.error('Error retrieving unread message count:', error);
                return 0;
            }
        })
    }

    public handleGroupTyping(socket: Socket): void {
        const typingUsers: {
            [roomId: string]: string[]
        } = {};

        socket.on('groupTyping', (data: {
            userId: string;
            roomId: string;
        }) => {
            const {
                roomId,
                userId
            } = data;

            if (!typingUsers[roomId]) {
                typingUsers[roomId] = [];
            }

            if (!typingUsers[roomId].includes(userId)) {
                typingUsers[roomId].push(userId);
            }

            // Broadcast the typing event to other users in the group
            socket.to(roomId).emit('groupTyping', {
                userId,
                roomId,
                typingUsers: typingUsers[roomId]
            });
        });

        socket.on('groupStopTyping', (data: {
            roomId: string,
            userId: string;
        }) => {
            const {
                roomId,
                userId
            } = data;

            if (typingUsers[roomId]) {
                typingUsers[roomId] = typingUsers[roomId].filter((userid) => userid !== userId);
            }

            // Broadcast the stop typing event to other users in the group
            socket.to(roomId).emit('groupStopTyping', {
                userId,
                roomId,
                typingUsers: typingUsers[roomId]
            });
        });
    }

    public handleAddReaction(socket: Socket): void {
        socket.on('addReaction', async (data: {
            userId: string,
            messageId: string,
            reaction: string
        }) => {
            const {
                messageId,
                reaction,
                userId
            } = data;

            const user = await User.findById(userId);

            if (!user) {
                logger.debug({ event: 'addReaction' }, `User not found with socket ID: ${socket.id}`);
                return;
            }

            try {
                const message = await Message.findById(messageId);

                if (!message) {
                    logger.debug({ event: 'addReaction' }, `Message not found with ID: ${messageId}`);
                    return;
                }

                const existingReaction = message.reactions.find(
                    (r: any) => r.sentBy.toString() === user._id.toString()
                );

                if (existingReaction) {
                    existingReaction.reaction = reaction;
                } else {
                    message.reactions.push({
                        sentBy: user._id,
                        reaction
                    });
                }

                const savedMessage = await message.save();

                socket.emit('reactionAdded', {
                    messageId: savedMessage._id,
                    reactions: savedMessage.reactions
                });
            } catch (error) {
                logger.error('Failed to add reaction:', error.message);
            }
        });
    }

    public handleRemoveReaction(socket: Socket): void {
        socket.on('removeReaction', async (data: {
            messageId: string,
            userId: string
        }) => {
            const {
                messageId,
                userId
            } = data;

            const user = await User.findById(userId);

            if (!user) {
                logger.debug({ event: 'removeReaction' }, `User not found with socket ID: ${socket.id}`);
                return;
            }

            try {
                const message = await Message.findById(messageId);

                if (!message) {
                    logger.debug({ event: 'removeReaction' }, `Message not found with ID: ${messageId}`);
                    return;
                }

                const existingReactionIndex = message.reactions.findIndex(
                    (r: any) => r.sentBy.toString() === user._id.toString()
                );

                if (existingReactionIndex !== -1) {
                    message.reactions.splice(existingReactionIndex, 1);
                    const savedMessage = await message.save();

                    socket.emit('reactionRemoved', {
                        messageId: savedMessage._id,
                        reactions: savedMessage.reactions
                    });
                }
            } catch (error) {
                logger.error('Failed to remove reaction:', error.message);
            }
        });
    }

    private isOnline(socketId: string) {
        return this.io.sockets.sockets.hasOwnProperty(socketId);
    }

    private async getMessageReactions(messageId: string): Promise < Map < string, number > > {
        const message = await Message.findById(messageId);
        if (!message) {
            logger.error({ event: 'getReactions' }, `Message ${messageId} not found`);
            return null;
        }

        return message.reactions;
    }

    private async parseMentions(messageText: string): Promise<string[]> {
        const mentionRegex = /@(\w+)/g;
        const mentions = [];
        let match;
    
        while ((match = mentionRegex.exec(messageText)) !== null) {
            const username = match[1];
            const user = await User.findOne({ username });
            if (user) {
                mentions.push(user._id);
            }
        }
    
        return mentions;
    }

    private isGroupMember(group: any, user: string): boolean {
        return group.members.includes(user);
    }

    private isGroupOwner(group: any, user: string): boolean {
        return group.owner.equals(user);
    }
}

export default MessageHandler;