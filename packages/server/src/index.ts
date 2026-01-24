import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { initDB } from './db';
import { ingestionRouter, setBroadcastCallback } from './routes/ingestion';
import { queryRouter } from './routes/query';
import { WebSocketServer } from 'ws';
import http from 'http';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Debug logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', JSON.stringify(req.headers));
    next();
});

initDB();

app.use('/', ingestionRouter);
app.use('/api', queryRouter);

// Serve static UI files (only in standalone mode, not when used as VS Code extension)
const SERVE_UI = process.env.SERVE_UI !== 'false';
if (SERVE_UI) {
    const uiPath = path.join(__dirname, '../../ui/dist');
    app.use(express.static(uiPath));

    // Serve UI for all non-API routes (SPA fallback)
    app.get('*', (req, res, next) => {
        // Skip API routes and track endpoints
        if (req.path.startsWith('/api') || req.path.startsWith('/v2')) {
            return next();
        }
        res.sendFile(path.join(uiPath, 'index.html'));
    });
} else {
    // Simple root endpoint when UI serving is disabled
    app.get('/', (req, res) => {
        res.send('AppInsights-ite Emulator Running');
    });
}

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws: any) => {
    console.log('Client connected to Live Stream');
    ws.on('close', () => console.log('Client disconnected'));
});

// Broadcast telemetry to all connected clients
setBroadcastCallback((item: any) => {
    const message = JSON.stringify(item);
    wss.clients.forEach((client: any) => {
        if (client.readyState === 1) { // OPEN
            client.send(message);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    if (SERVE_UI) {
        console.log(`Web UI: http://localhost:${PORT}/`);
    }
});
