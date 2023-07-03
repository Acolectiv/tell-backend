import { Socket, Server } from "socket.io";

import {
    model
} from "mongoose";

const User = model("User");
const Group = model("Group");

class RoomHandler {
    public io: Server;

    constructor(server: Server) {
        this.io = server;

        console.log('[SocketIOHandler] RoomHandler initialized.');
    }

    public handleCreateRoom(socket: Socket): void {
        socket.on('createRoom', async (data: {
            roomName: string,
            userId: string
        }) => {
            // Create the room
            console.log(data.roomName)

            const newRoom = new Group({
                name: data.roomName,
                owner: data.userId
            });

            let room = await newRoom.save();

            console.log(`Room created: ${room._id}`);

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
                    console.error('Error finding room:', err);
                    return;
                }

                // Check if the user is already a member of the room
                const user = await User.findById(userId);
                if (user && room.members.includes(user._id)) {
                    console.log(`User is already a member of room: ${roomId}`);
                    return;
                }

                // Check if the user is the owner of the room
                if (user && room.owner.equals(user._id)) {
                    console.log(`User is the owner of room: ${roomId}. Entry denied.`);
                    return;
                }

                // Join the room
                socket.join(roomId);

                console.log(`User with socket ID ${socket.id} joined room: ${roomId}`);

                // Add the user's ID to the members array of the room
                if (user) {
                    room.members.push(user._id);
                    await room.save();
                }

                // Emit the room details to the user
                socket.emit('roomJoined', {
                    roomId: room._id,
                    name: room.name,
                    owner: room.owner
                });
            });
        });
    }

    public handleLeaveRoom(socket: Socket): void {
        socket.on('leaveRoom', async (roomId: string, userId) => {
            const user = await User.findById(userId);

            if (!user) {
                console.log(`User not found with socket ID: ${socket.id}`);
                return;
            }

            // Find the room in the database
            Group.findById(roomId, async (err: any, room: any) => {
                if (err || !room) {
                    console.error('Error finding room:', err);
                    return;
                }

                // Remove the user's ID from the members array
                const index = room.members.indexOf(user._id);
                if (index !== -1) {
                    room.members.splice(index, 1);
                    await room.save();
                }

                // Leave the room
                socket.leave(roomId);
                console.log(`User with socket ID ${socket.id} left room: ${roomId}`);
            });
        });
    }
}

export default RoomHandler;