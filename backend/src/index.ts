import dotenv from 'dotenv';
import http from 'http';
import { app } from './app.js';
import { Server } from 'socket.io';
dotenv.config({ path: './.env' });
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';
import { createMessage } from './controllers/message.controller.js';
import { createChatRoom } from './controllers/chatroom.controller.js';
import prisma from './utils/prisma.js';

const usedNames = new Set();

function generateUniqueName() {
    let name;
    do {
        name = uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        separator: '-',
        style: 'lowerCase',
        }) + '-' + Math.floor(Math.random() * 10000);
    } while (usedNames.has(name));
    const avatarUrl = `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(name)}`;

    usedNames.add(name);
    return { name, avatarUrl };
}
export default generateUniqueName;

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173'],
        credentials: true,
        methods: ['GET', 'POST'],
    },
});

io.on('connection', (socket) => {
    console.log(`Socket Connected: ${socket.id}`);

    socket.on("join_room", ({ roomId, userId }) => {
        socket.join(roomId);
        io.to(roomId).emit("user_joined", { userId, roomId });
    });

    socket.on("send_message", async({ roomId, userId, content, replyToId, isEncrypted, encryptedData }) => {
        try {
            const message = await createMessage({ 
                roomId, 
                senderId: userId, 
                content,
                replyToId: replyToId || null,
                isEncrypted: isEncrypted || false,
                encryptedData: encryptedData || null
            });
            io.to(roomId).emit("new_message", message);
        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit("error", { message: "Failed to send message" });
        }
    });

    socket.on("join_private", ({ userId, peerId, type }) => {
        const room = `private:${[userId, peerId].sort().join(":")}`;
        createChatRoom({ roomName: room, type: type as 'PRIVATE'|'AI', participantIds: [userId, peerId] });
        socket.join(room);

        io.to(room).emit("private_room_created", { userId, peerId, room });
    });

    socket.on("typing_start", ({ roomId, userId }) => {
        socket.to(roomId).emit("user_typing", { userId, roomId });
    });

    socket.on("typing_stop", ({ roomId, userId }) => {
        socket.to(roomId).emit("user_stopped_typing", { userId, roomId });
    });

    // Message validation handlers
    socket.on("validate_message", async({ messageId, validatedBy }) => {
        try {
            // Check if user is a validator
            const validator = await prisma.user.findUnique({
                where: { id: validatedBy }
            });

            if (!validator || validator.role !== 'VALIDATOR') {
                socket.emit("error", { message: "Only validators can validate messages" });
                return;
            }

            // Update message validation status
            const updatedMessage = await prisma.messages.update({
                where: { messageId },
                data: { isValidated: true },
                include: {
                    sender: {
                        select: {
                            id: true,
                            username: true,
                            profilePicture: true,
                            walletAddress: true
                        }
                    },
                    room: {
                        select: {
                            roomId: true,
                            roomName: true,
                            type: true
                        }
                    }
                }
            });

            // Emit validation event to all users in the room
            io.to(updatedMessage.roomId.toString()).emit("message_validated", {
                messageId,
                validatedBy,
                message: updatedMessage
            });

        } catch (error) {
            console.error("Error validating message:", error);
            socket.emit("error", { message: "Failed to validate message" });
        }
    });

    socket.on("unvalidate_message", async({ messageId, unvalidatedBy }) => {
        try {
            // Check if user is a validator
            const validator = await prisma.user.findUnique({
                where: { id: unvalidatedBy }
            });

            if (!validator || validator.role !== 'VALIDATOR') {
                socket.emit("error", { message: "Only validators can unvalidate messages" });
                return;
            }

            // Update message validation status
            const updatedMessage = await prisma.messages.update({
                where: { messageId },
                data: { isValidated: false },
                include: {
                    sender: {
                        select: {
                            id: true,
                            username: true,
                            profilePicture: true,
                            walletAddress: true
                        }
                    },
                    room: {
                        select: {
                            roomId: true,
                            roomName: true,
                            type: true
                        }
                    }
                }
            });

            // Emit unvalidation event to all users in the room
            io.to(updatedMessage.roomId.toString()).emit("message_unvalidated", {
                messageId,
                unvalidatedBy,
                message: updatedMessage
            });

        } catch (error) {
            console.error("Error unvalidating message:", error);
            socket.emit("error", { message: "Failed to unvalidate message" });
        }
    });

    // User presence handlers
    socket.on("user_online", ({ userId }) => {
        socket.broadcast.emit("user_online", { userId });
    });

    socket.on("user_offline", ({ userId }) => {
        socket.broadcast.emit("user_offline", { userId });
    });

    socket.on('disconnect', () => {
        console.log(`Socket Disconnected: ${socket.id}`);
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running at port ${process.env.PORT || 8000}`);
});