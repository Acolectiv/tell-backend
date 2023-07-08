import { Socket, Server } from "socket.io";

import { getStreams } from "../config/bunyan";

import {
    model
} from "mongoose";

const User = model("User");
const Message = model("Message");
const PrivateMessage = model("PrivateMessage");
const Group = model("Group");

import MessageIndexer from "../indexers/MessageIndexer";

import bunyan from "bunyan";

class MessageHandler {
    public io: Server;
    public messageIndexer: MessageIndexer;

    private logger: bunyan;

    constructor(server: Server) {
        this.io = server;
        this.messageIndexer = new MessageIndexer();

        this.logger = bunyan.createLogger({ name: "MessageHandler", streams: getStreams() });

        this.logger.debug({ event: 'MessageHandler' }, '[SocketIOHandler] MessageHandler initialized.');
    }

    public async storeMessage(
        sender: string,
        receiver: string,
        message: string,
        roomId ? : string,
        reactions: Array < string > = []
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
                    reactions
                });

                this.messageIndexer.indexGroupMessage({
                    groupId: roomId,
                    message,
                    sentBy: sender,
                    messageId: newMessage._id
                })

                group.messages.push(newMessage);
                await group.save();
                this.logger.debug({ event: 'storeMessage' }, 'message stored in the database and added to the group');
            } else {
                const newMessage = await PrivateMessage.create({
                    sender,
                    receiver,
                    message,
                    reactions
                });

                this.messageIndexer.indexPrivateMessage({
                    message,
                    senderId: sender,
                    receiverId: receiver,
                    messageId: newMessage._id
                });

                this.logger.debug({ event: 'storeMessage' }, 'private message stored in the database');
            }
        } catch (error) {
            this.logger.error('Error storing message in the database:', error);
        }
    }

    public handleMessage(socket: Socket): void {
        socket.on('message', async (data: {
            userId: string,
            message: string,
            room ? : string,
            reactions: Array < string > | []
        }) => {
            const {
                userId,
                message,
                room,
                reactions
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
                    reactions
                });

                await this.storeMessage(user._id, null, message, room);

                this.logger.debug({ event: 'handleMessage' }, `Message sent to room: ${room}`);
            } else {
                socket.broadcast.emit('message', {
                    sender: user.username,
                    message,
                    reactions
                });
                this.logger.debug({ event: 'handleMessage' }, 'Message broadcasted to all connected clients');
            }
        });
    }

    public handlePrivateMessage(socket: Socket): void {
        socket.on('privateMessage', async (data: {
            senderId: string,
            receiverId: string,
            message: string,
            reactions: Array < string > | []
        }) => {
            const {
                senderId,
                receiverId,
                message,
                reactions
            } = data;

            const sender = await User.findById(senderId);

            if (!sender) {
                console.log(`Sender not found with _id: ${senderId}`);
                return;
            }

            const receiver = await User.findById(receiverId);

            if (!receiver) {
                console.log(`Receiver not found with _id: ${receiverId}`);
                return;
            }

            await this.storeMessage(sender.username, receiver.username, message, null, reactions);

            if (receiver.socketId && this.isOnline(receiver.socektId)) {
                this.io.to(receiver.socketId).emit('privateMessage', {
                    sender: sender.username,
                    message,
                    reactions
                });
                this.logger.debug({ event: 'privateMessage' }, 'private message sent');
            } else {
                this.logger.debug({ event: 'privateMessage' }, 'receiver is currently offline');
            }
        });
    }

    public handleGroupMessage(socket: Socket): void {
        socket.on('groupMessage', async (data: {
            senderId: string,
            message: string,
            groupId: string,
            reactions: Array < string > | []
        }) => {
            const {
                senderId,
                groupId,
                message,
                reactions
            } = data;

            const group = await Group.findById(groupId);

            if (!group) {
                console.log(`Group not found with _id: ${groupId}`);
                return;
            }

            const newMessage = await Message.create({
                sender: senderId,
                message,
                reactions
            });

            this.messageIndexer.indexGroupMessage({
                groupId: groupId,
                message,
                sentBy: senderId,
                messageId: newMessage._id
            })

            this.io.to(groupId).emit('newGroupMessage', {
                groupId,
                senderId,
                message,
                messageId: newMessage._id
            });

            group.messages.push(newMessage);
            await group.save();
            this.logger.debug({ event: 'groupMessage' }, 'message stored in the database and added to the group');
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
            this.logger.debug({ event: 'typing' }, `User with socket ID ${socket.id} is typing in room: ${room}`);
        });

        socket.on('stopTyping', (room: string) => {
            socket.to(room).emit('stopTyping', socket.id);
            this.logger.debug({ event: 'stopTyping' }, `User with socket ID ${socket.id} stopped typing in room: ${room}`);
        });
    }

    public handleDeleteMessage(socket: Socket): void {
        socket.on("deleteMessage", async (data: {
            messageId: string
        }) => {
            const {
                messageId
            } = data;

            try {
                const message = await PrivateMessage.findByIdAndRemove(messageId).exec();
                if (message) {
                    socket.emit("messageDeleted", messageId);
                    this.logger.debug({ event: 'deleteMessage' }, `Message with ID ${messageId} deleted`);
                } else {
                    this.logger.debug({ event: 'deleteMessage' }, `Message with ID ${messageId} not found`);
                }
            } catch (error) {
                this.logger.error(`Error deleting message with ID ${messageId}:`, error);
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
                    this.logger.debug({ event: 'seenMessage' }, `Message with ID ${messageId} marked as seen`);
                } else {
                    this.logger.debug({ event: 'seenMessage' }, `Message with ID ${messageId} not found`);
                }
            } catch (error) {
                this.logger.error(`Error marking message with ID ${messageId} as seen:`, error);
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

            try {
                const message = await Message.findByIdAndUpdate(messageId, {
                    message: newMessageContent
                }, {
                    new: true
                }).exec();

                if (message) {
                    this.logger.debug({ event: 'updateMessageContent' }, `Message with ID ${messageId} content updated to: ${newMessageContent}`);
                } else {
                    this.logger.debug({ event: 'updateMessageContent' }, `Message with ID ${messageId} not found`);
                }
            } catch (error) {
                this.logger.error(`Error updating message with ID ${messageId} content:`, error);
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

            try {
                const count = await Message.countDocuments({
                    receiver: receiverId,
                    seenBy: {
                        $ne: receiverId
                    }
                }).exec();
                return count;
            } catch (error) {
                this.logger.error('Error retrieving unread message count:', error);
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
                this.logger.debug({ event: 'addReaction' }, `User not found with socket ID: ${socket.id}`);
                return;
            }

            try {
                const message = await Message.findById(messageId);

                if (!message) {
                    this.logger.debug({ event: 'addReaction' }, `Message not found with ID: ${messageId}`);
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
                this.logger.error('Failed to add reaction:', error.message);
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
                this.logger.debug({ event: 'removeReaction' }, `User not found with socket ID: ${socket.id}`);
                return;
            }

            try {
                const message = await Message.findById(messageId);

                if (!message) {
                    this.logger.debug({ event: 'removeReaction' }, `Message not found with ID: ${messageId}`);
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
                this.logger.error('Failed to remove reaction:', error.message);
            }
        });
    }

    private isOnline(socketId: string) {
        return this.io.sockets.sockets.hasOwnProperty(socketId);
    }
}

export default MessageHandler;