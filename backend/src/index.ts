import dotenv from 'dotenv';
import http from 'http';
import { app } from './app.js';
import { Server } from 'socket.io';
dotenv.config({ path: './.env' });
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

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
});

server.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running at port ${process.env.PORT || 8000}`);
});