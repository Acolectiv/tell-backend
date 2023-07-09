import { Socket, Server } from "socket.io";

import {
    model
} from "mongoose";

const User = model("User");
const Group = model("Group");

import logger from "../utils/logger";

class RoomHandler {
    public io: Server;

    constructor(server: Server) {
        this.io = server;

        logger.info({ event: 'RoomHandler' }, '[SocketIOHandler] RoomHandler initialized.');
    }

    public handleCreateRoom(socket: Socket): void {
        socket.on('createRoom', async (data: {
            roomName: string,
            userId: string
        }) => {
            const newRoom = new Group({
                name: data.roomName,
                owner: data.userId
            });

            let room = await newRoom.save();

            logger.info({ event: 'createRoom' }, `Room created: ${room._id}`);

            socket.emit('roomCreated', {
                roomId: room._id,
                name: room.name,
                owner: room.owner
            });
        });
    }

    public handleJoinRoom(socket: Socket): void {
        socket.on('joinRoom', (roomId: string, userId: string) => {
            // Find the room in the database
            Group.findById(roomId, async (err: any, room: any) => {
                if (err || !room) {
                    logger.error({ event: 'joinRoom' }, 'Error finding room:', err);
                    return;
                }

                // Check if the user is already a member of the room
                const user = await User.findById(userId);

                if (user && room.bannedMembers.includes(user._id)) {
                    logger.info({ event: 'joinRoom' }, `User is banned from room: ${roomId}`);
                    return;
                }

                if (user && this.isGroupMember(room, user)) {
                    logger.info({ event: 'joinRoom' }, `User is already a member of room: ${roomId}`);
                    return;
                }

                // Check if the user is the owner of the room
                if (user && this.isGroupOwner(room, user)) {
                    logger.info({ event: 'joinRoom' }, `User is the owner of room: ${roomId}. Entry denied.`);
                    return;
                }

                // Join the room
                socket.join(roomId);

                logger.info({ event: 'joinRoom' }, `User with socket ID ${socket.id} joined room: ${roomId}`);

                // Add the user's ID to the members array of the room
                if (user) {
                    this.addUserToGroup(room, user);

                    await user.save();
                    await room.save();
                }

                // Emit the room details to the user
                socket.emit('roomJoined', {
                    roomId: room._id,
                    name: room.name,
                    owner: room.owner,
                    userId: user._id
                });
            });
        });
    }

    public handleLeaveRoom(socket: Socket): void {
        socket.on('leaveRoom', async (roomId: string, userId) => {
            const user = await User.findById(userId);

            if (!user) {
                logger.info({ event: 'leaveRoom' }, `User not found with socket ID: ${socket.id}`);
                return;
            }

            // Find the room in the database
            Group.findById(roomId, async (err: any, room: any) => {
                if (err || !room) {
                    logger.error({ event: 'leaveRoom' }, 'Error finding room:', err);
                    return;
                }

                this.removeUserFromGroup(room, user);

                await room.save();
                await user.save();

                // Leave the room
                socket.leave(roomId);

                socket.emit('roomLeft', {
                    roomId: room._id,
                    name: room.name,
                    owner: room.owner,
                    userId: user._id
                });

                logger.info({ event: 'leaveRoom' }, `User with socket ID ${socket.id} left room: ${roomId}`);
            });
        });
    }

    private async kickGroupUser(group: any, kickedId: string, kickerId: string): Promise < void > {
        if(!group || !kickedId || !kickerId) return;

        let kickedUser = await User.findById(kickedId);

        this.removeUserFromGroup(group, kickedUser);

        group.logs.push(this.getLogObject('kick', kickerId, kickedId));
        await group.save();
        await kickedUser.save();

        this.io.sockets.sockets.get(kickedUser).leave(group._id);
    }

    public handleKickGroupUser(socket: Socket): void {
        socket.on('kickGroupUser', async (obj: {
            groupId: string,
            kickedId: string,
            kickerId: string
        }) => {
            let {
                groupId,
                kickedId,
                kickerId
            } = obj;

            let kicker = await User.findById(kickerId);
            let group = await Group.findById(groupId);

            if(!group || !kicker) return;

            if(group.owner !== kicker._id) return;

            await this.kickGroupUser(group, kickedId, kickerId);

            socket.emit('groupUserKicked', {
                groupId,
                kickedId,
                kickerId
            })
        })
    }

    private async banGroupUser(group: any, bannedId: string, bannerId: string): Promise<void> {
        if (!group || !bannedId || !bannerId) return;
    
        let bannedUser = await User.findById(bannedId);
    
        // Add the user's ID to the banned members array of the group
        if (bannedUser && !this.isUserBanned(group, bannedUser._id)) {
            group.bannedMembers.push(bannedUser._id);
            group.logs.push(this.getLogObject('ban', bannerId, bannedId));
        }
    
        // If the user is currently a member, remove them
        this.removeUserFromGroup(group, bannedUser);

        await group.save();
        await bannedUser.save();

        this.io.sockets.sockets.get(bannedUser).leave(group._id);
    }
    
    public handleBanGroupUser(socket: Socket): void {
        socket.on('banGroupUser', async (obj: {
            groupId: string,
            bannedId: string,
            bannerId: string
        }) => {
            let {
                groupId,
                bannedId,
                bannerId
            } = obj;
    
            let banner = await User.findById(bannerId);
            let group = await Group.findById(groupId);
    
            if (!group || !banner) return;
    
            if (group.owner !== banner._id) return;
    
            await this.banGroupUser(group, bannedId, bannerId);
    
            socket.emit('groupUserBanned', {
                groupId,
                bannedId,
                bannerId
            });

            this.io.to(groupId).emit('groupUserBanned', {
                groupId,
                bannedId,
                bannerId
            });
        });
    }

    private async unbanGroupUser(group: any, unbannedId: string, unbannerId: string): Promise<void> {
        if (!group || !unbannedId || !unbannerId) return;
    
        let unbannedUser = await User.findById(unbannedId);
    
        // Remove the user's ID from the banned members array of the group
        if(!this.isUserBanned(group, unbannedUser._id)) return;

        const index = group.bannedMembers.indexOf(unbannedUser._id);
    
        if (index !== -1) {
            group.bannedMembers.splice(index, 1);
            group.logs.push(this.getLogObject('unban', unbannerId, unbannedId));

            await group.save();
        } else return;
    }
    
    public handleUnbanGroupUser(socket: Socket): void {
        socket.on('unbanGroupUser', async (obj: {
            groupId: string,
            unbannedId: string,
            unbannerId: string
        }) => {
            let {
                groupId,
                unbannedId,
                unbannerId
            } = obj;
    
            let unbanner = await User.findById(unbannerId);
            let group = await Group.findById(groupId);
    
            if (!group || !unbanner) return;
    
            if (group.owner !== unbanner._id) return;
    
            await this.unbanGroupUser(group, unbannedId, unbannerId);
    
            socket.emit('groupUserUnbanned', {
                groupId,
                unbannedId,
                unbannerId
            });

            this.io.to(groupId).emit('groupUserUnbanned', {
                groupId,
                unbannedId,
                unbannerId
            });
        });
    }

    private getLogObject(actionType: string, actionTakenBy: string, actionTakenAgainst: string): {
        actionType: string,
        actionTakenBy: string,
        actionTakenAgainst: string,
        createdAt: number
    } {
        logger.info({ event: 'getLogObject' }, 'action log inserted.');

        return {
            actionType,
            actionTakenBy,
            actionTakenAgainst,
            createdAt: Date.now()
        }
    }

    private isGroupMember(group: any, user: any): boolean {
        return group.members.includes(user._id);
    }

    private isGroupOwner(group: any, user: any): boolean {
        return group.owner.equals(user._id);
    }

    private addUserToGroup(group: any, user: any): void {
        group.members.push(user._id);
        user.rooms.push(group._id);
    }

    private removeUserFromGroup(group: any, user: any): void {
        const groupIndex = group.members.indexOf(user._id);
        const userIndex = user.rooms.indexOf(group._id);

        if (groupIndex !== -1) {
            group.members.splice(groupIndex, 1);
        }
    
        if(userIndex !== -1) {
            user.rooms.splice(userIndex, 1);
        }
    }

    private isUserBanned(group: any, user: any): boolean {
        return group.bannedMembers.includes(user._id);
    }
}

export default RoomHandler;