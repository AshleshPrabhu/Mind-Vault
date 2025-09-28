import type { Request, Response } from "express";
import prisma  from "../utils/prisma.js";
import generateUniqueName from "../index.js";


const usersignuporlogin = async(req:Request,res:Response)=>{
    try {
        const {address,type} = req.body;
        if(!address){
            return res.status(400).json({message:"Address is required", success: false});
        }
        const user = await prisma.user.findUnique({where:{walletAddress:address}});
        if(!user){
            const newUser = await prisma.user.create({
                data:{
                    username:generateUniqueName().name || "LONE WOLF - " + Math.floor(Math.random()*1000),
                    profilePicture:generateUniqueName().avatarUrl || "https://avatar.iran.liara.run/public",
                    walletAddress:address,
                    ...(type === 'VALIDATOR' && { type: 'VALIDATOR' })
                }
            });
            if(!newUser){
                return res.status(400).json({message:"Failed to create user",success:false});
            }
            return res.status(201).json({
                message:"User created successfully",
                user:newUser,
                success:true
            });
        }
        return res.status(200).json({
            message:"User logged in successfully",
            user:user,
            success:true
        });
    } catch (error) {
        console.error("Error in user signup or login:", error);
        return res.status(500).json({
            message:"Internal server error",
            success:false
        });
    }
}

const getHistory=async(req:Request,res:Response)=>{
    try {
        const { address } = req.body;
        if (!address) {
            return res.status(400).json({ message: "Address is required", success: false });
        }
        const user = await prisma.user.findUnique({ where: { walletAddress: address } });
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }
        const history = await prisma.messages.findMany({ where: { senderId: user.id } });
        return res.status(200).json({ message: "User history fetched successfully", history, success: true });
    } catch (error) {
        console.error("Error fetching user history:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

const getPrivateChats=async(req:Request,res:Response)=>{
    try {
        const { address } = req.body;
        if (!address) {
            return res.status(400).json({ message: "Address is required", success: false });
        }
        const user = await prisma.user.findUnique({ where: { walletAddress: address } });
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }
        let chatrooms = await prisma.chatRooms.findMany({
            where:{
                AND:[
                    { type:"PRIVATE" },
                    {participants:{some:{id:user.id}}}
                ]
            },
            include:{
                messages:true,
                participants:true
            }
        });
        if (!chatrooms) {
            chatrooms=[];
        }
        return res.status(200).json({ message: "Private chats fetched successfully", chatrooms, success: true });
    } catch (error) {
        console.error("Error fetching private chats:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
        
    }
}

const getPaymentHistory = async(req:Request,res:Response)=>{
    try {
        const { address } = req.body;
        if (!address) {
            return res.status(400).json({ message: "Address is required", success: false });
        }
        const user = await prisma.user.findUnique({ where: { walletAddress: address } });
        if (!user) {   
            return res.status(404).json({ message: "User not found", success: false });
        }
        const payments = await prisma.nGOHistory.findMany({ where: { userId: user.id } });
        return res.status(200).json({ message: "Payment history fetched successfully", payments, success: true });
        
    } catch (error) {
        console.error("Error fetching payment history:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
        
    }
}

const setPaymentHistory = async(req:Request,res:Response)=>{
    try {
        const { address, amount } = req.body;
        if (!address || !amount) {
            return res.status(400).json({ message: "Address and amount are required", success: false });
        }
        const user = await prisma.user.findUnique({ where: { walletAddress: address } });
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }
        const payment = await prisma.nGOHistory.create({
            data: {
                userId: user.id,
                amountDonated: amount
            }
        });
        return res.status(201).json({ message: "Payment history set successfully", payment, success: true });
        
    } catch (error) {
        console.error("Error setting payment history:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
        
    }
}

const getCommunityRank = async(req:Request, res:Response) => {
    try {
        const { address } = req.params;
        if (!address) {
            return res.status(400).json({ message: "Address is required", success: false });
        }
        
        const user = await prisma.user.findUnique({ 
            where: { walletAddress: address },
            include: {
                messages: true,
                ngoHistories: true
            }
        });
        
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        const messageCount = user.messages.length;
        const validatedMessages = user.messages.filter(msg => msg.isValidated).length;
        const totalDonations = user.ngoHistories.reduce((sum, donation) => sum + donation.amountDonated, 0);
        const tokenBalance = user.tokenBalance;
        
        const score = (
            (messageCount * 2) +
            (validatedMessages * 10) +     
            (totalDonations * 0.1) +       
            (tokenBalance * 0.05)          
        );

        const allUsers = await prisma.user.findMany({
            include: {
                messages: true,
                ngoHistories: true
            }
        });

        const usersWithScores = allUsers.map(u => {
            const msgs = u.messages.length;
            const validated = u.messages.filter(msg => msg.isValidated).length;
            const donations = u.ngoHistories.reduce((sum, donation) => sum + donation.amountDonated, 0);
            const userScore = (
                (msgs * 2) +
                (validated * 10) +
                (donations * 0.1) +
                (u.tokenBalance * 0.05)
            );
            
            return {
                id: u.id,
                username: u.username,
                walletAddress: u.walletAddress,
                profilePicture: u.profilePicture,
                score: userScore,
                messageCount: msgs,
                validatedMessages: validated,
                totalDonations: donations,
                tokenBalance: u.tokenBalance
            };
        });

        usersWithScores.sort((a, b) => b.score - a.score);
        
        
        const userRank = usersWithScores.findIndex(u => u.walletAddress === address) + 1;
        const totalUsers = usersWithScores.length;
        
        
        const leaderboard = usersWithScores.slice(0, 10);

        const percentile = Math.round(((totalUsers - userRank + 1) / totalUsers) * 100);
        
        
        let tier = "Bronze";
        let tierColor = "#CD7F32";
        if (percentile >= 90) {
            tier = "Diamond";
            tierColor = "#B9F2FF";
        } else if (percentile >= 75) {
            tier = "Platinum";
            tierColor = "#E5E4E2";
        } else if (percentile >= 50) {
            tier = "Gold";
            tierColor = "#FFD700";
        } else if (percentile >= 25) {
            tier = "Silver";
            tierColor = "#C0C0C0";
        }

        const rankingData = {
            user: {
                rank: userRank,
                score: Math.round(score),
                tier,
                tierColor,
                percentile,
                messageCount,
                validatedMessages,
                totalDonations,
                tokenBalance
            },
            leaderboard: leaderboard.map((u, index) => ({
                rank: index + 1,
                username: u.username,
                profilePicture: u.profilePicture,
                score: Math.round(u.score),
                tier: index < 3 ? ["Diamond", "Platinum", "Gold"][index] : "Silver"
            })),
            totalUsers
        };

        return res.status(200).json({
            message: "Community ranking fetched successfully",
            data: rankingData,
            success: true
        });
        
    } catch (error) {
        console.error("Error fetching community ranking:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

const getLeaderboard = async(req:Request, res:Response) => {
    try {
        const { limit = 50 } = req.query;
        
        const allUsers = await prisma.user.findMany({
            include: {
                messages: true,
                ngoHistories: true
            }
        });

        const usersWithScores = allUsers.map(u => {
            const msgs = u.messages.length;
            const validated = u.messages.filter(msg => msg.isValidated).length;
            const donations = u.ngoHistories.reduce((sum, donation) => sum + donation.amountDonated, 0);
            const userScore = (
                (msgs * 2) +
                (validated * 10) +
                (donations * 0.1) +
                (u.tokenBalance * 0.05)
            );
            
            return {
                rank: 0, 
                username: u.username,
                profilePicture: u.profilePicture,
                walletAddress: u.walletAddress,
                score: Math.round(userScore),
                messageCount: msgs,
                validatedMessages: validated,
                totalDonations: donations,
                tokenBalance: u.tokenBalance
            };
        });

        usersWithScores.sort((a, b) => b.score - a.score);
        
        const rankedUsers = usersWithScores.map((user, index) => ({
            ...user,
            rank: index + 1
        })).slice(0, Number(limit));

        return res.status(200).json({
            message: "Leaderboard fetched successfully",
            data: rankedUsers,
            success: true
        });
        
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

export {
    usersignuporlogin,
    getHistory,
    getPrivateChats,
    getPaymentHistory,
    setPaymentHistory,
    getCommunityRank,
    getLeaderboard
};