import {
    Server,
    Socket
} from "socket.io";

import { getStreams } from "./config/bunyan";

import MessageHandler from "./handlers/MessageHandler";
import UserHandler from "./handlers/UserHandler";
import RoomHandler from "./handlers/RoomHandler";

import AuthHandler from "./handlers/AuthHandler";

import http from "http";

import bunyan from "bunyan";

class SocketIOHandler {
    private io: Server;
    private connectedClients: Set < string > ;

    private logger: bunyan;

    private messageHandler: MessageHandler;
    private userHandler: UserHandler;
    private roomHandler: RoomHandler;

    constructor(server: http.Server) {
        this.io = new Server(server);

        this.messageHandler = new MessageHandler(this.io);
        this.userHandler = new UserHandler(this.io);
        this.roomHandler = new RoomHandler(this.io);

        this.logger = bunyan.createLogger({ name: "SocketIOHandler", streams: getStreams() });

        this.connectedClients = new Set < string > ();

        this.logger.info({ event: 'SocketIOHandler' }, '[SocketIOHandler] Handler has been initialized.');
    }

    public configureSockets(): void {
        this.io.on('connection', async (socket: Socket) => {
            this.logger.info({ event: 'connection' }, `a user connected with socket ID: ${socket.id}`);

            const user = await AuthHandler.authenticateUser(socket);

            if (!user) {
                socket.disconnect();
                return;
            }

            await this.userHandler.updateUserSocketId(user._id, socket.id);

            this.connectedClients.add(socket.id);

            this.logger.info({ event: 'connection' }, 'registering all the listeners');

            // user handlers
            this.userHandler.handleUserStatus(socket);
            this.userHandler.handleDisconnect(socket);
            this.userHandler.handleUserPresenceUpdate(socket);
            this.userHandler.handleUserSendFriendRequest(socket);
            this.userHandler.handleUserAcceptFriendRequest(socket);
            this.userHandler.handleUserRejectFriendRequest(socket);

            // room handlers
            this.roomHandler.handleJoinRoom(socket);
            this.roomHandler.handleLeaveRoom(socket);
            this.roomHandler.handleCreateRoom(socket);
            this.roomHandler.handleKickGroupUser(socket);
            this.roomHandler.handleBanGroupUser(socket);
            this.roomHandler.handleUnbanGroupUser(socket);

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
            this.messageHandler.handleGroupMessage(socket);

            this.logger.info({ event: 'connection' }, 'finished registering listeners, setting user presence to online');

            this.userHandler.updateUserStatus(user._id, true);
        });
    }
}

export default SocketIOHandler;