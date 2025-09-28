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
        origin: ['https://mindvault-engi.vercel.app'],
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

    socket.on("join_private", async ({ userId, peerId, type }) => {
        console.log(` join_private event received:`, { userId, peerId, type });
        
        try {
            const [user, peer] = await Promise.all([
                prisma.user.findUnique({ where: { id: parseInt(userId) } }),
                prisma.user.findUnique({ where: { id: parseInt(peerId) } })
            ]);
            
            if (!user || !peer) {
                socket.emit("error", { message: "User not found" });
                return;
            }
            
            const roomName = [user.username, peer.username].sort().join(" & ");
            console.log(` Creating chat room with name:`, roomName);
            
            const result = await createChatRoom({ 
                roomName, 
                type: type as 'PRIVATE'|'AI', 
                participantIds: [userId, peerId] 
            });
            
            console.log(` Chat room creation result:`, result);
            
            if (result.success) {
                const socketRoom = `private:${[userId, peerId].sort().join(":")}`;
                socket.join(socketRoom);
                console.log(`Socket ${socket.id} joined room ${socketRoom}`);
                
                io.to(socketRoom).emit("private_room_created", { 
                    userId, 
                    peerId, 
                    room: socketRoom,
                    chatRoom: result.data 
                });
                console.log(`Emitted private_room_created event to room ${socketRoom}`);
            } else {
                console.error(`Failed to create chat room:`, result.message);
                socket.emit("error", { message: result.message });
            }
        } catch (error) {
            console.error(` Error in join_private handler:`, error);
            socket.emit("error", { message: "Failed to create private chat" });
        }
    });

    socket.on("typing_start", ({ roomId, userId }) => {
        socket.to(roomId).emit("user_typing", { userId, roomId });
    });

    socket.on("typing_stop", ({ roomId, userId }) => {
        socket.to(roomId).emit("user_stopped_typing", { userId, roomId });
    });
    socket.on("validate_message", async({ messageId, validatedBy }) => {
        try {
            //
            const validator = await prisma.user.findUnique({
                where: { id: validatedBy }
            });

            if (!validator || validator.role !== 'VALIDATOR') {
                socket.emit("error", { message: "Only validators can validate messages" });
                return;
            }

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
            const validator = await prisma.user.findUnique({
                where: { id: unvalidatedBy }
            });

            if (!validator || validator.role !== 'VALIDATOR') {
                socket.emit("error", { message: "Only validators can unvalidate messages" });
                return;
            }

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