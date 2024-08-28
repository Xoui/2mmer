import express from 'express';
import { createBareServer } from '@tomphttp/bare-server-node';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
import { createServer as createHttpServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import { Server as SocketIOServer } from 'socket.io'; // Import Socket.IO

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const bare = createBareServer("/bare/");

// Serve static files
app.use(express.static(path.join(__dirname, 'static')));

// Define routes
const routes = [
    { path: '/~', file: 'apps.html' },
    { path: '/0', file: 'tabs.html' },
    { path: '/1', file: 'go.html' },
    { path: '/', file: 'index.html' },
    { path: '/chat', file: 'chat.html' },
];

routes.forEach((route) => {
    app.get(route.path, (req, res) => {
        res.sendFile(path.join(__dirname, 'static', route.file));
    });
});

let server;
if (fs.existsSync(path.join(__dirname, 'key.pem')) && fs.existsSync(path.join(__dirname, 'cert.pem'))) {
    const options = {
        key: fs.readFileSync(path.join(__dirname, 'key.pem')),
        cert: fs.readFileSync(path.join(__dirname, 'cert.pem')),
    };
    server = createHttpsServer(options, app);
} else {
    server = createHttpServer(app);
}

// Initialize socket.io server
const io = new SocketIOServer(server);

// Array to store chat history
let chatHistory = [];

// Handle socket.io connections
io.on('connection', (socket) => {
    console.log('A user connected');

    // Send existing chat history to the newly connected user
    socket.emit('chat history', chatHistory);

    socket.on('chat message', (msg) => {
        // Save message to chat history
        chatHistory.push(msg);

        // Limit chat history to the last 100 messages to avoid excessive memory usage
        if (chatHistory.length > 100) {
            chatHistory.shift(); // Remove the oldest message
        }

        // Broadcast the message to all clients
        io.emit('chat message', msg);
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
    console.log(`Summer running on port ${addr.port}`);
    console.log('');
    console.log('You can now view it in your browser.');
    console.log(`Local: http://${addr.family === 'IPv6' ? `[${addr.address}]` : addr.address}:${addr.port}`);
    try { console.log(`On Your Network: http://${address.ip()}:${addr.port}`); } catch (err) { /* Can't find LAN interface */ }
    if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
        console.log(`Replit: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
    }
});
