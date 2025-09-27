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

export {
    usersignuporlogin,
    getHistory,
    getPrivateChats,
    getPaymentHistory,
    setPaymentHistory
};