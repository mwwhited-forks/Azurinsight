import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
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

app.get('/', (req, res) => {
    res.send('AppInsights-ite Emulator Running');
});

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
});
