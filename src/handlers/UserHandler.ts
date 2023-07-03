import { Socket, Server } from "socket.io";

import {
    model
} from "mongoose";

const User = model("User");

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
        socket.on('setUserStatus', async (data: { isOnline: boolean }) => {
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
            let statuses = [ "online", "away", "dnd" ];

            if(!statuses.includes(status)) return;

            await User.findByIdAndUpdate(userId, {
                status
            });

            console.log(`user presense for ${userId} updated to ${status}`);
        } catch(e) {
            console.log(`Error updating user presence: ${e}`);
        }
    }

    public handleUserPresenceUpdate(socket: Socket): void {
        socket.on('setUserPresence', async (data: { status: string }) => {
            const user = await this.getUserBySocketId(socket.id);

            if(user) {
                await this.updateUserPresence(user._id.toString(), data.status);

                socket.broadcast.emit('userPresence', {
                    userId: user._id.toString(),
                    status: data.status
                });
            }
        });
    }
}

export default UserHandler;