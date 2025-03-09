import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import EventBus from "../EventBus";
import { CREDIT_TYPES } from '../constants/creditTypes';

const dbName = 'Budget';
const currentDbVersion = 5;

const TABLES = {
    tags: `CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tagName TEXT UNIQUE,
        icon TEXT,
        creditType TEXT CHECK (creditType IN (${Object.values(CREDIT_TYPES).map(_ => `'${_}'`).join()})),
        creditAmount REAL DEFAULT NULL,
        startDay INTEGER DEFAULT NULL    -- src/constants/weekdays.js
    );`,
    icons: `CREATE TABLE IF NOT EXISTS icons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        library TEXT,
        icon TEXT
    );`,
    transactions: `CREATE TABLE IF NOT EXISTS Transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        TransactionDate datetime,
        description TEXT,
        amount money,
        sort_order INTEGER
    );`,
    transactionTags: `CREATE TABLE IF NOT EXISTS TransactionTags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        TransactionId INTEGER,
        TagId INTEGER
    );`,
    settings: `CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting TEXT
    );`
};

const MIGRATIONS = {
    4: (db) => {
        const columns = db.getAllSync(`PRAGMA table_info(tags);`).map((col) => col.name);
        if (!columns.includes('creditType')) {
            db.execSync(`ALTER TABLE tags ADD COLUMN creditType TEXT CHECK (creditType IN (${Object.values(CREDIT_TYPES).map(_ => `'${_}'`).join()}));`);
            db.execSync("ALTER TABLE tags ADD COLUMN creditAmount REAL DEFAULT NULL;");
            db.execSync("ALTER TABLE tags ADD COLUMN startDay INTEGER DEFAULT NULL;");
          }
    },
    5: (db) => {
        db.execSync("ALTER TABLE Transactions ADD COLUMN sort_order INTEGER NULL;");
        db.execSync("UPDATE Transactions SET sort_order = id;");
    }
};

const Database = {
    initializeDatabase: () => {
        const db = SQLite.openDatabaseSync(dbName);
        Object.values(TABLES).forEach((query) => db.execSync(query));
        Database.runMigrations(db);
        db.closeSync();
    },

    runMigrations: (db) => {
        let dbVersion = 1;
        const result = db.prepareSync(`PRAGMA user_version;`).executeSync().getAllSync();
        if (result.length > 0) dbVersion = result[0]["user_version"];
        if (dbVersion < currentDbVersion) {
            for (let version = dbVersion + 1; version <= currentDbVersion; version++) {
                if (MIGRATIONS[version]) {
                    MIGRATIONS[version](db);
                }
                db.execSync(`PRAGMA user_version = ${version};`);
            }
        }
    },

    deleteDatabase: async () => {
        const dbPath = `${FileSystem.documentDirectory}SQLite/${dbName}`;
        try {
            await FileSystem.deleteAsync(dbPath, { idempotent: true });
            return { status: 'success', error: null };
        } catch (error) {
            return { status: 'failed', error: error.message };
        }
    },

    getSettings: () => {
        const db = SQLite.openDatabaseSync(dbName);
        const stmt = db.prepareSync('SELECT setting FROM settings LIMIT 1');
        const result = stmt.executeSync().getAllSync();
        stmt.finalizeSync();
        db.closeSync();
        return result.length > 0 ? JSON.parse(result[0].setting) : {};
    },

    updateSettings: (setting) => {
        const db = SQLite.openDatabaseSync(dbName);
        const stmt = db.prepareSync('INSERT OR REPLACE INTO settings (id, setting) VALUES(1, ?)');
        stmt.executeSync([JSON.stringify(setting)]);

        stmt.finalizeSync();
        db.closeSync();
        EventBus.emit("settingsUpdated");
    },

    selectTags: (tagName, pageSize) => {
        const db = SQLite.openDatabaseSync(dbName);
        const stmt = db.prepareSync('SELECT * FROM tags WHERE tagName LIKE ? ORDER BY tagName ASC LIMIT ?');
        const result = stmt.executeSync(`%${tagName}%`, pageSize).getAllSync();

        stmt.finalizeSync();
        db.closeSync();
        return result;
    },

    insertTag: (tagName, icon, creditType, creditAmount, startDay) => {
        const db = SQLite.openDatabaseSync(dbName);
        const stmt = db.prepareSync('INSERT INTO tags (tagName, icon, creditType, creditAmount, startDay) VALUES (?, ?, ?, ?, ?)');
        stmt.executeSync(tagName, icon, creditType, creditAmount, startDay);

        stmt.finalizeSync();
        db.closeSync();
        EventBus.emit("tagsUpdated");
    },

    updateTag: (tagName, icon, creditType, creditAmount, startDay, id) => {
        const db = SQLite.openDatabaseSync(dbName);
        const stmt = db.prepareSync('UPDATE tags SET tagName = ?, icon = ?, creditType = ?, creditAmount = ?, startDay = ? WHERE id = ?');
        stmt.executeSync(tagName, icon, creditType, creditAmount === '' ? null : creditAmount, startDay, id);

        stmt.finalizeSync();
        db.closeSync();
        EventBus.emit("tagsUpdated");
    },

    delTag: (id) => {
        const db = SQLite.openDatabaseSync(dbName);
        const stmt = db.prepareSync('DELETE FROM tags WHERE id = ?');
        stmt.executeSync(id);

        stmt.finalizeSync();
        db.closeSync();
        EventBus.emit("tagsUpdated");
    },

    selectIcons: () => {
        const db = SQLite.openDatabaseSync(dbName);
        const stmt = db.prepareSync('SELECT * FROM icons');
        const result = stmt.executeSync().getAllSync();

        stmt.finalizeSync();
        db.closeSync();
        return result;
    },

    insertIcon: (library, icon) => {
        const db = SQLite.openDatabaseSync(dbName);
        const stmt = db.prepareSync('INSERT INTO icons (library, icon) VALUES (?, ?)');
        stmt.executeSync(library, icon);

        stmt.finalizeSync();
        db.closeSync();
    },

    delIcon: (library, icon) => {
        const db = SQLite.openDatabaseSync(dbName);
        const stmt = db.prepareSync('DELETE FROM icons WHERE library = ? AND icon = ?');
        stmt.executeSync(library, icon);

        stmt.finalizeSync();
        db.closeSync();
    },

    delAllIcons: () => {
        const db = SQLite.openDatabaseSync(dbName);
        const stmt = db.prepareSync('DELETE FROM icons');
        stmt.executeSync();

        stmt.finalizeSync();
        db.closeSync();
    },

    selectTransactions: () => {
        const db = SQLite.openDatabaseSync(dbName);
        const stmt = db.prepareSync('SELECT * FROM Transactions Order By TransactionDate DESC, sort_order DESC');
        const rows = stmt.executeSync().getAllSync();

        const stmt2 = db.prepareSync(`
            SELECT tag.*,
                (
                    SELECT SUM(amount)
                    FROM Transactions _t
                    WHERE EXISTS (
                        SELECT 1 FROM TransactionTags _tt
                        WHERE _tt.TransactionId = _t.id
                        AND _tt.TagId = tag.id
                    )
                    AND (_t.TransactionDate < t.TransactionDate
                        OR (_t.TransactionDate = t.TransactionDate AND _t.sort_order <= t.sort_order))
                    AND CASE
                        WHEN tag.creditType = '${CREDIT_TYPES["NoPeriod"]}' THEN 1
                        WHEN tag.creditType = '${CREDIT_TYPES["Yearly"]}' THEN strftime('%Y', _t.TransactionDate) = strftime('%Y', t.TransactionDate)
                        WHEN tag.creditType = '${CREDIT_TYPES["Monthly"]}' THEN strftime('%Y-%m', date(_t.TransactionDate, '-' || (tag.startDay - 1) || ' days')) = strftime('%Y-%m', date(t.TransactionDate, '-' || (tag.startDay - 1) || ' days'))
                        WHEN tag.creditType = '${CREDIT_TYPES["Weekly"]}' THEN date(_t.TransactionDate, 'weekday 0', '-' || (tag.startDay - 1) || ' days') = date(t.TransactionDate, 'weekday 0', '-' || (tag.startDay - 1) || ' days')
                        ELSE 0
                    END
                ) AS creditUsed
            FROM Transactions t
            INNER JOIN TransactionTags tt ON t.id = tt.TransactionId
            INNER JOIN Tags tag ON tag.id = tt.TagId
            WHERE t.id = ?
        `);

        const result = rows.map((row) => {
            const tags = stmt2.executeSync(row.id).getAllSync();
            return { ...row, tags };
        });

        stmt.finalizeSync();
        stmt2.finalizeSync();
        db.closeSync();
        return result;
    },

    insertTransaction: (transactionDate, description, amount, tags) => {
        const db = SQLite.openDatabaseSync(dbName);
        const stmt = db.prepareSync('INSERT INTO Transactions (TransactionDate, description, amount) VALUES (?, ?, ?)');
        const result = stmt.executeSync(transactionDate, description, amount);
        db.execSync('UPDATE Transactions SET sort_order = last_insert_rowid() WHERE id = last_insert_rowid();');
        const stmt2 = db.prepareSync('INSERT INTO TransactionTags (TransactionId, TagId) VALUES (?, ?)');
        tags.forEach((tagId) => stmt2.executeSync(result.lastInsertRowId, tagId));

        stmt.finalizeSync();
        stmt2.finalizeSync();
        db.closeSync();
        EventBus.emit("transactionsUpdated");
        console.log("Transaction inserted");
    },
    updateTransaction: (id, transactionDate, description, amount, tags) => {
        const db = SQLite.openDatabaseSync(dbName);
        const stmt = db.prepareSync('UPDATE Transactions SET TransactionDate = ?, description = ?, amount = ? WHERE id = ?');
        const result = stmt.executeSync(transactionDate, description, amount, id);

        const stmt2 = db.prepareSync('DELETE FROM TransactionTags WHERE TransactionId = ?');
        stmt2.executeSync(id);

        const stmt3 = db.prepareSync('INSERT INTO TransactionTags (TransactionId, TagId) VALUES (?, ?)');
        tags.forEach((tagId) => stmt3.executeSync(id, tagId));

        stmt.finalizeSync();
        stmt2.finalizeSync();
        stmt3.finalizeSync();
        db.closeSync();
        EventBus.emit("transactionsUpdated");
    },

    delTransaction: (id) => {
        const db = SQLite.openDatabaseSync(dbName);

        const stmt = db.prepareSync('DELETE FROM Transactions WHERE id = ?');
        stmt.executeSync(id);

        const stmt2 = db.prepareSync('DELETE FROM TransactionTags WHERE TransactionId = ?');
        stmt2.executeSync(id);

        stmt.finalizeSync();
        stmt2.finalizeSync();
        db.closeSync();
        EventBus.emit("transactionsUpdated");
    }
};

export default Database;
