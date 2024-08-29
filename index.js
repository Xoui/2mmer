import express from 'express';
import { createBareServer } from '@tomphttp/bare-server-node';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
import { createServer as createHttpServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import { Server as SocketIOServer } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const bare = createBareServer("/bare/");
const server = fs.existsSync(path.join(__dirname, 'key.pem')) && fs.existsSync(path.join(__dirname, 'cert.pem'))
    ? createHttpsServer({
        key: fs.readFileSync(path.join(__dirname, 'key.pem')),
        cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
      }, app)
    : createHttpServer(app);

const io = new SocketIOServer(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'static')));

// Define routes
const routes = [
    { path: '/~', file: 'apps.html' },
    { path: '/0', file: 'tabs.html' },
    { path: '/1', file: 'go.html' },
    { path: '/', file: 'index.html' },
    { path: '/chat', file: 'chat.html' },
    { path: '/voice', file: 'voice.html' },
    { path: '/voice-rooms', file: 'voice_rooms.html' },
];

routes.forEach((route) => {
    app.get(route.path, (req, res) => {
        res.sendFile(path.join(__dirname, 'static', route.file));
    });
});

// WebSocket communication
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });

    socket.on('offer', (data) => {
        io.to(data.room).emit('offer', data.offer);
    });

    socket.on('answer', (data) => {
        io.to(data.room).emit('answer', data.answer);
    });

    socket.on('ice-candidate', (data) => {
        io.to(data.room).emit('ice-candidate', data.candidate);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Middleware for bare server
app.use((req, res, next) => {
    if (bare.shouldRoute(req)) {
        bare.routeRequest(req, res);
    } else {
        res.status(500).send('Error');
    }
});

// Handle WebSocket upgrade requests
server.on('upgrade', (req, socket, head) => {
    if (bare.shouldRoute(req, socket, head)) {
        bare.routeUpgrade(req, socket, head);
    } else {
        socket.end();
    }
});

server.listen(PORT, () => {
    const addr = server.address();
    console.log(`Server running on port ${addr.port}`);
    console.log(`Local: http://${addr.family === 'IPv6' ? `[${addr.address}]` : addr.address}:${addr.port}`);
    try { console.log(`On Your Network: http://${address.ip()}:${addr.port}`); } catch (err) { /* Can't find LAN interface */ }
    if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
        console.log(`Replit: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
    }
});
