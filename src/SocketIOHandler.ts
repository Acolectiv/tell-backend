import {
    Server,
    Socket
} from "socket.io";

import MessageHandler from "./handlers/MessageHandler";
import UserHandler from "./handlers/UserHandler";
import RoomHandler from "./handlers/RoomHandler";

import AuthHandler from "./handlers/AuthHandler";

import http from "http";

class SocketIOHandler {
    private io: Server;
    private connectedClients: Set < string > ;

    private messageHandler: MessageHandler;
    private userHandler: UserHandler;
    private roomHandler: RoomHandler;

    constructor(server: http.Server) {
        this.io = new Server(server);

        this.messageHandler = new MessageHandler(this.io);
        this.userHandler = new UserHandler(this.io);
        this.roomHandler = new RoomHandler(this.io);

        this.connectedClients = new Set < string > ();

        console.log('[SocketIOHandler] Handler has been initialized.');
    }

    public configureSockets(): void {
        this.io.on('connection', async (socket: Socket) => {
            console.log(`A user connected with socket ID: ${socket.id}`);

            const user = await AuthHandler.authenticateUser(socket);

            if (!user) {
                socket.disconnect();
                return;
            }

            await this.userHandler.updateUserSocketId(user._id, socket.id);

            this.connectedClients.add(socket.id);

            console.log('registering all the listeners');

            // user handlers
            this.userHandler.handleUserStatus(socket);
            this.userHandler.handleDisconnect(socket);
            this.userHandler.handleUserPresenceUpdate(socket);

            // room handlers
            this.roomHandler.handleJoinRoom(socket);
            this.roomHandler.handleLeaveRoom(socket);
            this.roomHandler.handleCreateRoom(socket);

            // message handlers
            this.messageHandler.handleMessage(socket);
            this.messageHandler.handlePrivateMessage(socket);
            this.messageHandler.fetchMessagesBetweenUsers(socket);
            this.messageHandler.handleTyping(socket);
            this.messageHandler.handleDeleteMessage(socket);
            this.messageHandler.handleSeenMessage(socket);
            this.messageHandler.updateMessageContent(socket);
            this.messageHandler.getUnreadMessageCount(socket);
            this.messageHandler.handleAddReaction(socket);
            this.messageHandler.handleRemoveReaction(socket);

            console.log('finished registering listeners, setting user presence to online');

            this.userHandler.updateUserStatus(user._id, true);
        });
    }
}

export default SocketIOHandler;