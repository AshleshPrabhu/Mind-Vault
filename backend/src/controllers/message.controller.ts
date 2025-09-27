import type { Request, Response } from "express";
import prisma from "../utils/prisma.js";

const createMessage = async (req: Request, res: Response) => {
    try {
        const { content, senderId, roomId, replyToId } = req.body;
        
        if (!content || !senderId || !roomId) {
            return res.status(400).json({
                message: "Content, senderId, and roomId are required",
                success: false
            });
        }

        const sender = await prisma.user.findUnique({
            where: { id: parseInt(senderId) }
        });
        if (!sender) {
            return res.status(404).json({
                message: "Sender not found",
                success: false
            });
        }

        const room = await prisma.chatRooms.findUnique({
            where: { roomId: parseInt(roomId) }
        });
        if (!room) {
            return res.status(404).json({
                message: "Chat room not found",
                success: false
            });
        }

        if (replyToId) {
            const parentMessage = await prisma.messages.findUnique({
                where: { messageId: parseInt(replyToId) }
            });
            if (!parentMessage) {
                return res.status(404).json({
                    message: "Parent message not found",
                    success: false
                });
            }
        }

        const newMessage = await prisma.messages.create({
            data: {
                content,
                senderId: parseInt(senderId),
                roomId: parseInt(roomId),
                replyToId: replyToId ? parseInt(replyToId) : null
            },
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
                },
                replyTo: {
                    include: {
                        sender: {
                            select: {
                                username: true,
                                profilePicture: true
                            }
                        }
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
            }
        });

        return res.status(201).json({
            message: "Message created successfully",
            data: newMessage,
            success: true
        });
        
    } catch (error) {
        console.error("Error in creating message:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

const getMessagesByRoom = async (req: Request, res: Response) => {
    try {
        const { roomId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        if (!roomId) {
            return res.status(400).json({
                message: "Room ID is required",
                success: false
            });
        }

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const messages = await prisma.messages.findMany({
            where: { 
                roomId: parseInt(roomId),
                replyToId: null
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        profilePicture: true,
                        walletAddress: true
                    }
                },
                replies: {
                    include: {
                        sender: {
                            select: {
                                id: true,
                                username: true,
                                profilePicture: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: parseInt(limit as string)
        });

        const totalMessages = await prisma.messages.count({
            where: { roomId: parseInt(roomId), replyToId: null }
        });

        return res.status(200).json({
            message: "Messages fetched successfully",
            data: messages,
            pagination: {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total: totalMessages,
                totalPages: Math.ceil(totalMessages / parseInt(limit as string))
            },
            success: true
        });

    } catch (error) {
        console.error("Error fetching messages:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

const likeMessage = async (req: Request, res: Response) => {
    try {
        const { messageId } = req.params;

        if (!messageId) {
            return res.status(400).json({
                message: "Message ID is required",
                success: false
            });
        }

        const message = await prisma.messages.findUnique({
            where: { messageId: parseInt(messageId) }
        });

        if (!message) {
            return res.status(404).json({
                message: "Message not found",
                success: false
            });
        }

        const updatedMessage = await prisma.messages.update({
            where: { messageId: parseInt(messageId) },
            data: { likes: { increment: 1 } },
            include: {
                sender: {
                    select: {
                        username: true,
                        profilePicture: true
                    }
                }
            }
        });

        return res.status(200).json({
            message: "Message liked successfully",
            data: updatedMessage,
            success: true
        });

    } catch (error) {
        console.error("Error liking message:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}


const dislikeMessage = async (req: Request, res: Response) => {
    try {
        const { messageId } = req.params;

        if (!messageId) {
            return res.status(400).json({
                message: "Message ID is required",
                success: false
            });
        }

        const message = await prisma.messages.findUnique({
            where: { messageId: parseInt(messageId) }
        });

        if (!message) {
            return res.status(404).json({
                message: "Message not found",
                success: false
            });
        }

        const updatedMessage = await prisma.messages.update({
            where: { messageId: parseInt(messageId) },
            data: { dislikes: { increment: 1 } },
            include: {
                sender: {
                    select: {
                        username: true,
                        profilePicture: true
                    }
                }
            }
        });

        return res.status(200).json({
            message: "Message disliked successfully",
            data: updatedMessage,
            success: true
        });

    } catch (error) {
        console.error("Error disliking message:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}


const validateMessage = async (req: Request, res: Response) => {
    try {
        const { messageId } = req.params;
        const { validatorId } = req.body;

        if (!messageId || !validatorId) {
            return res.status(400).json({
                message: "Message ID and validator ID are required",
                success: false
            });
        }

        const validator = await prisma.user.findUnique({
            where: { id: parseInt(validatorId) }
        });

        if (!validator || validator.role !== 'VALIDATOR') {
            return res.status(403).json({
                message: "Only validators can validate messages",
                success: false
            });
        }

        const message = await prisma.messages.findUnique({
            where: { messageId: parseInt(messageId) }
        });

        if (!message) {
            return res.status(404).json({
                message: "Message not found",
                success: false
            });
        }

        if (message.isValidated) {
            return res.status(400).json({
                message: "Message is already validated",
                success: false
            });
        }

        const updatedMessage = await prisma.messages.update({
            where: { messageId: parseInt(messageId) },
            data: { isValidated: true },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        profilePicture: true
                    }
                }
            }
        });

        return res.status(200).json({
            message: "Message validated successfully",
            data: updatedMessage,
            success: true
        });

    } catch (error) {
        console.error("Error validating message:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

const markMessageAsRewarded = async (req: Request, res: Response) => {
    try {
        const { messageId } = req.params;

        if (!messageId) {
            return res.status(400).json({
                message: "Message ID is required",
                success: false
            });
        }

        const message = await prisma.messages.findUnique({
            where: { messageId: parseInt(messageId) }
        });

        if (!message) {
            return res.status(404).json({
                message: "Message not found",
                success: false
            });
        }

        if (!message.isValidated) {
            return res.status(400).json({
                message: "Message must be validated before rewarding",
                success: false
            });
        }

        if (message.rewarded) {
            return res.status(400).json({
                message: "Message is already rewarded",
                success: false
            });
        }

        const updatedMessage = await prisma.messages.update({
            where: { messageId: parseInt(messageId) },
            data: { rewarded: true },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        profilePicture: true,
                        tokenBalance: true
                    }
                }
            }
        });

        return res.status(200).json({
            message: "Message marked as rewarded successfully",
            data: updatedMessage,
            success: true
        });

    } catch (error) {
        console.error("Error marking message as rewarded:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

const getMessageById = async (req: Request, res: Response) => {
    try {
        const { messageId } = req.params;

        if (!messageId) {
            return res.status(400).json({
                message: "Message ID is required",
                success: false
            });
        }

        const message = await prisma.messages.findUnique({
            where: { messageId: parseInt(messageId) },
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
                },
                replyTo: {
                    include: {
                        sender: {
                            select: {
                                username: true,
                                profilePicture: true
                            }
                        }
                    }
                },
                replies: {
                    include: {
                        sender: {
                            select: {
                                id: true,
                                username: true,
                                profilePicture: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!message) {
            return res.status(404).json({
                message: "Message not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Message fetched successfully",
            data: message,
            success: true
        });

    } catch (error) {
        console.error("Error fetching message:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

export {
    createMessage,
    getMessagesByRoom,
    likeMessage,
    dislikeMessage,
    validateMessage,
    markMessageAsRewarded,
    getMessageById
};