import { Router } from 'express';
import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';

export const ingestionRouter = Router();

let broadcastCallback: ((item: any) => void) | null = null;

export const setBroadcastCallback = (cb: (item: any) => void) => {
    broadcastCallback = cb;
};

const insertTelemetry = (item: any) => {
    const { time, iKey, name, tags, data } = item;
    // itemType is usually derived from data.baseType or similar, but for now let's try to extract it or default it
    let itemType = 'unknown';
    if (data && data.baseType) {
        itemType = data.baseType.replace('Data', '');
    }

    const stmt = db.prepare(`
    INSERT INTO telemetry (id, time, iKey, name, tags, data, itemType)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

    stmt.run(
        uuidv4(),
        time,
        iKey,
        name,
        JSON.stringify(tags),
        JSON.stringify(data),
        itemType,
        (err: Error) => {
            if (err) {
                console.error('Error inserting telemetry:', err);
            } else {
                if (broadcastCallback) {
                    broadcastCallback(item);
                }
            }
        }
    );
    stmt.finalize();
};

ingestionRouter.post('/v2/track', (req, res) => {
    const item = req.body;
    if (item) {
        insertTelemetry(item);
    }
    res.status(200).json({ itemsReceived: 1, itemsAccepted: 1, errors: [] });
});

ingestionRouter.post('/v2.1/track', (req, res) => {
    const items = req.body; // Expecting an array
    if (Array.isArray(items)) {
        items.forEach(insertTelemetry);
        res.status(200).json({ itemsReceived: items.length, itemsAccepted: items.length, errors: [] });
    } else {
        // Sometimes it might be a single object if not strictly following the batch spec, but v2.1 is usually batch
        if (items && typeof items === 'object') {
            insertTelemetry(items);
            res.status(200).json({ itemsReceived: 1, itemsAccepted: 1, errors: [] });
        } else {
            res.status(400).json({ error: 'Invalid body' });
        }
    }
});
