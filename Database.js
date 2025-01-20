import * as SQLite from 'expo-sqlite';

let dbInstances = {};

const Database = {
    initializeDatabase: (dbName) => {
        if (!dbInstances[dbName]) {
            dbInstances[dbName] = { db: SQLite.openDatabaseSync(dbName), init: false };
        }
        const db = dbInstances[dbName];
        if (!db.init) {
            if (dbName === 'tags.db') {
                db.db.execSync(
                    'CREATE TABLE IF NOT EXISTS tags (id INTEGER PRIMARY KEY AUTOINCREMENT, tagName TEXT UNIQUE, icon TEXT);'
                );
                const columns = db.db.getAllSync(`PRAGMA table_info(tags);`).map((col) => col.name);
                if (!columns.includes('icon')) {
                    db.db.execSync('ALTER TABLE tags ADD COLUMN icon TEXT;');
                }

                db.init = true;
            } else if (dbName === 'icons.db') {
                db.db.execSync(
                    'CREATE TABLE IF NOT EXISTS icons (id INTEGER PRIMARY KEY AUTOINCREMENT, library TEXT, icon TEXT);'
                );
                db.init = true;
            }
            if (!db.select) {
                if (dbName === 'tags.db') {
                    db.select = db.db.prepareSync(
                        'SELECT * FROM tags WHERE tagName LIKE ? ORDER BY tagName ASC LIMIT ?'
                    );
                    db.insert = db.db.prepareSync(
                        'INSERT INTO tags (tagName, icon) VALUES (?, ?)'
                    );
                    db.update = db.db.prepareSync(
                        'UPDATE tags SET tagName = ?, icon = ? WHERE id = ?'
                    );
                    db.del = db.db.prepareSync(
                        'DELETE FROM tags WHERE id = ?'
                    );
                } else if (dbName === 'icons.db') {
                    db.select = db.db.prepareSync(
                        'SELECT * FROM icons'
                    );
                    db.insert = db.db.prepareSync(
                        'INSERT INTO icons (library, icon) VALUES (?, ?)'
                    );
                    db.del = db.db.prepareSync(
                        'DELETE FROM icons WHERE library = ? AND icon = ?'
                    );
                }
            }
        }
        return db;
    },

    cleanupDatabase: (dbName) => {
        const db = dbInstances[dbName];
        if (db) {
            if (db.select) {
                db.select.finalizeSync();
            }
            if (db.insert) {
                db.insert.finalizeSync();
            }
            if (db.update) {
                db.update.finalizeSync();
            }
            if (db.del) {
                db.del.finalizeSync();
            }
            db.db.closeSync();
            dbInstances[dbName] = null;
        }
    },
};

export default Database;
