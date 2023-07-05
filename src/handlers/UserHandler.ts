import {
    Socket,
    Server
} from "socket.io";

import {
    model
} from "mongoose";

const User = model("User");
const FriendRequest = model("FriendRequest");

import IUser from "../interfaces/IUser";

class UserHandler {
    public io: Server;

    constructor(server: Server) {
        this.io = server;

        console.log('[SocketIOHandler] UserHandler initialized.');
    }

    public async getUserBySocketId(socketId: string): Promise < IUser | null > {
        try {
            return await User.findOne({
                socketId
            });
        } catch (error) {
            console.error('Error retrieving user:', error);
            return null;
        }
    }

    public async updateUserSocketId(userId: string, socketId: string): Promise < void > {
        try {
            await User.findByIdAndUpdate(userId, {
                socketId
            });
        } catch (error) {
            console.error('Error updating user socketId:', error);
        }
    }

    public handleDisconnect(socket: Socket): void {
        socket.on('disconnect', async () => {
            console.log(`A user disconnected with socket ID: ${socket.id}`);

            const user = await this.getUserBySocketId(socket.id);

            if (user) {
                await this.updateUserStatus(user._id, false);
                await this.updateUserSocketId(user._id.toString(), '');
            }
        });
    }

    public async updateUserStatus(userId: string, isOnline: boolean): Promise < void > {
        try {
            await User.findByIdAndUpdate(userId, {
                isOnline
            });
            console.log(`User presence updated: User ${userId} is ${isOnline ? 'online' : 'offline'}`);
        } catch (error) {
            console.error('Error updating user presence:', error);
        }
    }

    public handleUserStatus(socket: Socket): void {
        socket.on('setUserStatus', async (data: {
            isOnline: boolean
        }) => {
            const user = await this.getUserBySocketId(socket.id);
            if (user) {
                await this.updateUserStatus(user._id.toString(), data.isOnline);
                socket.broadcast.emit('userStatus', {
                    userId: user._id.toString(),
                    isOnline: data.isOnline
                });
            }
        });
    }

    public async updateUserPresence(userId: string, status: string): Promise < void > {
        try {
            let statuses = ["online", "away", "dnd"];

            if (!statuses.includes(status)) return;

            await User.findByIdAndUpdate(userId, {
                status
            });

            console.log(`user presense for ${userId} updated to ${status}`);
        } catch (e) {
            console.log(`Error updating user presence: ${e}`);
        }
    }

    public handleUserPresenceUpdate(socket: Socket): void {
        socket.on('setUserPresence', async (data: {
            status: string
        }) => {
            const user = await this.getUserBySocketId(socket.id);

            if (user) {
                await this.updateUserPresence(user._id.toString(), data.status);

                socket.broadcast.emit('userPresence', {
                    userId: user._id.toString(),
                    status: data.status
                });
            }
        });
    }

    public handleUserSendFriendRequest(socket: Socket): void {
        socket.on('friendRequest', async (data: {
            senderId: string
        }) => {
            const {
                senderId
            } = data;
            const recipientId = socket.id;

            this.sendFriendRequest(senderId, recipientId);
        });
    }

    public handleUserAcceptFriendRequest(socket: Socket): void {
        socket.on('acceptFriendRequest', async (data: {
            senderId: string
        }) => {
            const {
                senderId
            } = data;
            const recipientId = socket.id;

            this.acceptFriendRequest(senderId, recipientId);
        });
    }

    public handleUserRejectFriendRequest(socket: Socket): void {
        socket.on('rejectFriendRequest', async (data: {
            senderId: string
        }) => {
            const {
                senderId
            } = data;
            const recipientId = socket.id;

            this.rejectFriendRequest(senderId, recipientId);
        });
    }

    private async sendFriendRequest(senderId: string, recipientId: string): Promise < void > {
        const sender = await User.findById(senderId);
        const recipient = await User.findById(recipientId);

        if (sender && recipient) {
            const friendRequest = await this.storeFriendRequest(sender._id, recipient._id);

            recipient.friendRequests.push(friendRequest);
            await recipient.save();

            if (recipient.isOnline && recipient.socketId) {
                this.io.to(recipient.socketId).emit('friendRequest', {
                    senderId: sender._id
                });
            }
        }
    }

    public async acceptFriendRequest(userId: string, requesterId: string): Promise < void > {
        await this.updateFriendStatus(userId, requesterId, true);

        await this.deleteFriendRequest(userId, requesterId);

        const requester = await User.findById(requesterId);

        if (requester.isOnline && requester.socketId) {
            this.io.to(requester.socketId).emit('friendRequestAccepted', {
                userId
            });
        }
    }

    public async rejectFriendRequest(userId: string, requesterId: string): Promise < void > {
        await this.updateFriendStatus(userId, requesterId, false);

        await this.deleteFriendRequest(userId, requesterId);

        const requester = await User.findById(requesterId);

        if (requester.isOnline && requester.socketId) {
            this.io.to(requester.socketId).emit('friendRequestRejected', {
                userId
            });
        }
    }

    private async storeFriendRequest(senderId: string, recipientId: string): Promise < void > {
        const friendRequest = new FriendRequest({
            senderId,
            recipientId
        });

        await friendRequest.save();

        return friendRequest;
    }

    private async updateFriendStatus(userId: string, friendId: string, isFriend: boolean): Promise < void > {
        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (user && friend) {
            if (isFriend) {
                user.friends.push(friend._id);
                friend.friends.push(user._id);
            } else {
                user.friends.pull(friend._id);
                friend.friends.pull(user._id);
            }

            await user.save();
            await friend.save();
        }
    }

    private async deleteFriendRequest(userId: string, requesterId: string): Promise < void > {
        await FriendRequest.findOneAndDelete({
            senderId: requesterId,
            recipientId: userId
        });
    }
}

export default UserHandler;