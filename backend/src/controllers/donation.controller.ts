import type { Request, Response } from "express";
import prisma from "../utils/prisma.js";
import tokenMintingService from "../services/tokenMinting.service.js";

const getUserTokenBalance = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                message: "User ID is required",
                success: false
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: {
                id: true,
                username: true,
                walletAddress: true,
                tokenBalance: true
            }
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        const databaseBalance = user.tokenBalance || 0;
        
        let onChainBalance = 0;
        if (user.walletAddress) {
            onChainBalance = await tokenMintingService.getTokenBalance(user.walletAddress);
            console.log(`📊 Balance check for ${user.username}:`, {
                walletAddress: user.walletAddress,
                databaseBalance,
                onChainBalance,
                willUse: onChainBalance > 0 ? 'on-chain' : 'database'
            });
        }
        const totalBalance = onChainBalance > 0 ? onChainBalance : databaseBalance;

        return res.status(200).json({
            message: "Token balance retrieved successfully",
            data: {
                userId: user.id,
                username: user.username,
                walletAddress: user.walletAddress,
                databaseBalance: user.tokenBalance || 0,
                onChainBalance: onChainBalance,
                totalBalance: totalBalance
            },
            success: true
        });

    } catch (error) {
        console.error("Error getting user token balance:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

const getUserDonationHistory = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        if (!userId) {
            return res.status(400).json({
                message: "User ID is required",
                success: false
            });
        }

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const donations = await prisma.nGOHistory.findMany({
            where: { userId: parseInt(userId) },
            orderBy: { donatedAt: 'desc' },
            skip,
            take: parseInt(limit as string),
            select: {
                id: true,
                amountDonated: true,
                donatedAt: true,
            }
        });

        const donationsWithNGODetails = donations.map((donation, index) => {
            const ngoMapping = [
                {
                    name: "Manas Foundation",
                    contractAddress: process.env.MANAS_FOUNDATION_CONTRACT || "",
                    focus: "Youth Mental Health"
                },
                {
                    name: "Minds Foundation", 
                    contractAddress: process.env.MINDS_FOUNDATION_CONTRACT || "",
                    focus: "Community Wellness"
                },
                {
                    name: "Mitram Foundation",
                    contractAddress: process.env.MITRAM_FOUNDATION_CONTRACT || "",
                    focus: "Stigma Reduction"
                }
            ];

            const ngoIndex = index % 3;
            const ngo = ngoMapping[ngoIndex];
            
            if (!ngo) {
                throw new Error(`NGO mapping not found for index ${ngoIndex}`);
            }

            return {
                id: donation.id,
                ngoName: ngo.name,
                contractAddress: ngo.contractAddress,
                amount: donation.amountDonated,
                date: donation.donatedAt,
                status: "Completed",
                focus: ngo.focus,
                txHash: null 
            };
        });

        const totalDonations = await prisma.nGOHistory.count({
            where: { userId: parseInt(userId) }
        });

        return res.status(200).json({
            message: "Donation history retrieved successfully",
            data: {
                donations: donationsWithNGODetails,
                pagination: {
                    page: parseInt(page as string),
                    limit: parseInt(limit as string),
                    total: totalDonations,
                    totalPages: Math.ceil(totalDonations / parseInt(limit as string))
                }
            },
            success: true
        });

    } catch (error) {
        console.error("Error getting donation history:", error);
        return res.status(500).json({
            message: "Internal server error", 
            success: false
        });
    }
};

const recordDonation = async (req: Request, res: Response) => {
    try {
        const { userId, amount, ngoId, txHash } = req.body;

        if (!userId || !amount || !ngoId) {
            return res.status(400).json({
                message: "User ID, amount, and NGO ID are required",
                success: false
            });
        }

        const donation = await prisma.nGOHistory.create({
            data: {
                userId: parseInt(userId),
                amountDonated: parseInt(amount),
                donatedAt: new Date()
            }
        });

        return res.status(201).json({
            message: "Donation recorded successfully",
            data: donation,
            success: true
        });

    } catch (error) {
        console.error("Error recording donation:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

export {
    getUserTokenBalance,
    getUserDonationHistory,
    recordDonation
};