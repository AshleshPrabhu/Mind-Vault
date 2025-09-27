import type { Request, Response } from "express";
import prisma from "../utils/prisma.js";

const createChatRoom = async (req: Request, res: Response) => {
    try {
        const { roomName, type, participantIds } = req.body;
        
        if (!roomName || !type) {
            return res.status(400).json({
                message: "Room name and type are required",
                success: false
            });
        }

        if (!['GLOBAL', 'PRIVATE','AI'].includes(type)) {
            return res.status(400).json({
                message: "Room type must be either GLOBAL or PRIVATE",
                success: false
            });
        }

        const existingRoom = await prisma.chatRooms.findUnique({
            where: { roomName }
        });

        if (existingRoom) {
            return res.status(400).json({
                message: "Room name already exists",
                success: false
            });
        }

        let participants: number[] = [];
        if (participantIds && Array.isArray(participantIds) && type === 'PRIVATE' ) {
            participants = [...new Set([...participants, ...participantIds.map((id: string) => parseInt(id))])];
        }

        if (type === 'PRIVATE' && participants.length > 1) {
            const existingUsers = await prisma.user.findMany({
                where: { id: { in: participants } }
            });

            if (existingUsers.length !== participants.length) {
                return res.status(400).json({
                    message: "One or more participants not found",
                    success: false
                });
            }
        }

        const newChatRoom = await prisma.chatRooms.create({
            data: {
                roomName,
                type,
                ... (type === 'PRIVATE' && { participants: { connect: participants.map(id => ({ id })) } })
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        username: true,
                        profilePicture: true,
                        walletAddress: true
                    }
                },
                messages: {
                    include: {
                        sender: {
                            select: {
                                username: true,
                                profilePicture: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10 
                }
            }
        });

        return res.status(201).json({
            message: "Chat room created successfully",
            data: newChatRoom,
            success: true
        });

    } catch (error) {
        console.error("Error creating chat room:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

const getChatRoomById = async (req: Request, res: Response) => {
    try {
        const { roomId } = req.params;

        if (!roomId) {
            return res.status(400).json({
                message: "Room ID is required",
                success: false
            });
        }

        const chatRoom = await prisma.chatRooms.findUnique({
            where: { roomId: parseInt(roomId) },
            include: {
                participants: {
                    select: {
                        id: true,
                        username: true,
                        profilePicture: true,
                        walletAddress: true,
                        role: true
                    }
                },
                messages: {
                    include: {
                        sender: {
                            select: {
                                id: true,
                                username: true,
                                profilePicture: true
                            }
                        },
                        replies: {
                            include: {
                                sender: {
                                    select: {
                                        username: true,
                                        profilePicture: true
                                    }
                                }
                            }
                        }
                    },
                    where: { replyToId: null },
                    orderBy: { createdAt: 'desc' },
                    take: 50
                },
                _count: {
                    select: {
                        messages: true,
                        participants: true
                    }
                }
            }
        });

        if (!chatRoom) {
            return res.status(404).json({
                message: "Chat room not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Chat room fetched successfully",
            data: chatRoom,
            success: true
        });

    } catch (error) {
        console.error("Error fetching chat room:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

export {
    createChatRoom,
    getChatRoomById,
};
