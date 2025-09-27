import dotenv from 'dotenv';
import http from 'http';
import { app } from './app.js';
import { Server } from 'socket.io';
dotenv.config({ path: './.env' });

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
});

server.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running at port ${process.env.PORT || 8000}`);
});