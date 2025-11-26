import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../telemetry.sqlite');
export const db = new sqlite3.Database(dbPath);

export const initDB = () => {
    db.serialize(() => {
        db.run(`
      CREATE TABLE IF NOT EXISTS telemetry (
        id TEXT PRIMARY KEY,
        time TEXT,
        iKey TEXT,
        name TEXT,
        tags TEXT,
        data TEXT,
        itemType TEXT
      )
    `);
    });
};
