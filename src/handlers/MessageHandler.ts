import { Socket, Server } from "socket.io";

import {
    model
} from "mongoose";

const User = model("User");
const Message = model("Message");
const PrivateMessage = model("PrivateMessage");
const Group = model("Group");

class MessageHandler {
    public io: Server;

    constructor(server: Server) {
        this.io = server;

        console.log('[SocketIOHandler] MessageHandler initialized.');
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

                const newMessage = new Message({
                    sender,
                    message,
                    reactions
                });

                group.messages.push(newMessage);
                await group.save();
                console.log('Message stored in the database and added to the group');
            } else {
                const newMessage = new PrivateMessage({
                    sender,
                    receiver,
                    message,
                    reactions
                });

                await newMessage.save();
                console.log('Private message stored in the database');
            }
        } catch (error) {
            console.error('Error storing message in the database:', error);
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
                console.log(`Message sent to room: ${room}`);
            } else {
                socket.broadcast.emit('message', {
                    sender: user.username,
                    message,
                    reactions
                });
                console.log('Message broadcasted to all connected clients');
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

            this.storeMessage(sender.username, receiver.username, message, null, reactions);

            if (receiver.socketId && this.io.sockets.sockets.hasOwnProperty(receiver.socketId)) {
                this.io.to(receiver.socketId).emit('privateMessage', {
                    sender: sender.username,
                    message,
                    reactions
                });
                console.log('Private message sent');
            } else {
                console.log('Receiver is currently offline');
            }
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
            console.log(`User with socket ID ${socket.id} is typing in room: ${room}`);
        });

        socket.on('stopTyping', (room: string) => {
            socket.to(room).emit('stopTyping', socket.id);
            console.log(`User with socket ID ${socket.id} stopped typing in room: ${room}`);
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
                    console.log(`Message with ID ${messageId} deleted`);
                } else {
                    console.log(`Message with ID ${messageId} not found`);
                }
            } catch (error) {
                console.error(`Error deleting message with ID ${messageId}:`, error);
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
                    console.log(`Message with ID ${messageId} marked as seen`);
                } else {
                    console.log(`Message with ID ${messageId} not found`);
                }
            } catch (error) {
                console.error(`Error marking message with ID ${messageId} as seen:`, error);
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
                    console.log(`Message with ID ${messageId} content updated to: ${newMessageContent}`);
                } else {
                    console.log(`Message with ID ${messageId} not found`);
                }
            } catch (error) {
                console.error(`Error updating message with ID ${messageId} content:`, error);
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
                console.error('Error retrieving unread message count:', error);
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
                console.log(`User not found with socket ID: ${socket.id}`);
                return;
            }

            try {
                const message = await Message.findById(messageId);

                if (!message) {
                    console.log(`Message not found with ID: ${messageId}`);
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
                console.log('Failed to add reaction:', error.message);
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
                console.log(`User not found with socket ID: ${socket.id}`);
                return;
            }

            try {
                const message = await Message.findById(messageId);

                if (!message) {
                    console.log(`Message not found with ID: ${messageId}`);
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
                console.log('Failed to remove reaction:', error.message);
            }
        });
    }
}

export default MessageHandler;