import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import userRoutes from './routes/user.routes.js';
import messageRoutes from './routes/message.routes.js';
import chatroomRoutes from './routes/chatroom.routes.js';

const app = express();

const allowedOrigins = ['http://localhost:5173'];
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    })
);

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));

app.use(cookieParser());

app.use('/api/user', userRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/chatroom', chatroomRoutes);


export { app };