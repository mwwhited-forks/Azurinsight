import { Router } from 'express';
import { db } from '../db';

export const queryRouter = Router();

queryRouter.get('/query', (req, res) => {
    const { top = 100, skip = 0, filter } = req.query;

    let sql = `SELECT * FROM telemetry ORDER BY time DESC LIMIT ? OFFSET ?`;
    let params: any[] = [top, skip];

    // Basic filtering (improve as needed)
    if (filter) {
        // This is a placeholder for more complex filtering logic
        // For now, let's just allow filtering by itemType if provided in a specific way or just ignore
        // Real AppInsights query syntax is complex (KQL). We might just support basic OData-like or custom params for the emulator UI.
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ value: rows });
    });
});

queryRouter.delete('/purge', (req, res) => {
    const sql = `DELETE FROM telemetry`;
    db.run(sql, [], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Telemetry purged' });
    });
});

queryRouter.delete('/telemetry', (req, res) => {
    const { ids, start, end } = req.query;
    let sql = `DELETE FROM telemetry WHERE 1=1`;
    let params: any[] = [];

    if (ids) {
        const idArray = (ids as string).split(',');
        const placeholders = idArray.map(() => '?').join(',');
        sql += ` AND id IN (${placeholders})`;
        params.push(...idArray);
    }

    if (start) {
        sql += ` AND time >= ?`;
        params.push(start);
    }

    if (end) {
        sql += ` AND time <= ?`;
        params.push(end);
    }

    if (params.length === 0 && !ids) { // strictly if NO filters at all, though ids check is redundant with params.length check if we push ids to params.
        // Actually, if ids is present, params has it. So just check params.length
        res.status(400).json({ error: 'No criteria provided' });
        return;
    }

    db.run(sql, params, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Telemetry deleted', changes: this.changes });
    });
});
