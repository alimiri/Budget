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
        const columns = db.getAllSync(`PRAGMA table_info(Transactions);`).map((col) => col.name);
        if (!columns.includes('sort_order')) {
            db.execSync("ALTER TABLE Transactions ADD COLUMN sort_order INTEGER NULL;");
            db.execSync("UPDATE Transactions SET sort_order = id;");
        }
    }
};

const Database = {
    initializeDatabase: () => {
        const startTime = Date.now();
        console.log("initializeDatabase start");
        const db = SQLite.openDatabaseSync(dbName);
        Object.values(TABLES).forEach((query) => db.execSync(query));
        Database.runMigrations(db);
        db.closeSync();
        console.log("initializeDatabase finished", `Elapsed time: ${(Date.now() - startTime) / 1000}s`);
    },

    runMigrations: (db) => {
        const startTime = Date.now();
        console.log("runMigrations start");
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
        console.log("runMigrations finished", `Elapsed time: ${(Date.now() - startTime) / 1000}s`);
    },

    deleteDatabase: async () => {
        const startTime = Date.now();
        console.log("deleteDatabase start");
        const dbPath = `${FileSystem.documentDirectory}SQLite/${dbName}`;
        try {
            await FileSystem.deleteAsync(dbPath, { idempotent: true });
            EventBus.emit("transactionsUpdated");
            EventBus.emit("tagsUpdated");
            EventBus.emit("settingsUpdated");
            console.log("deleteDatabase finished", `Elapsed time: ${(Date.now() - startTime) / 1000}s`);
            return { status: 'success', error: null };
        } catch (error) {
            console.log("deleteDatabase finished", `Elapsed time: ${(Date.now() - startTime) / 1000}s`);
            return { status: 'failed', error: error.message };
        }
    },

    getSettings: () => {
        const startTime = Date.now();
        console.log("getSettings start");
        const db = SQLite.openDatabaseSync(dbName);
        const stmt = db.prepareSync('SELECT setting FROM settings LIMIT 1');
        const result = stmt.executeSync().getAllSync();
        stmt.finalizeSync();
        db.closeSync();
        console.log("getSettings finished", `Elapsed time: ${(Date.now() - startTime) / 1000}s`);
        return result.length > 0 ? JSON.parse(result[0].setting) : {
            ShowTransactions: {
                periodType: "monthly",
                nDays: 1,
                firstDayOfMonth: 1
            },
            Tags: {
                showCreditPercent: true,
                showCreditAmount: true
            }
        };
    },

    updateSettings: (setting) => {
        const startTime = Date.now();
        console.log("updateSettings start", setting);
        const db = SQLite.openDatabaseSync(dbName);
        const stmt = db.prepareSync('INSERT OR REPLACE INTO settings (id, setting) VALUES(1, ?)');
        stmt.executeSync([JSON.stringify(setting)]);

        stmt.finalizeSync();
        db.closeSync();
        EventBus.emit("settingsUpdated");
        console.log("updateSettings finished", `Elapsed time: ${(Date.now() - startTime) / 1000}s`);
    },

    selectTags: (tagName, pageSize) => {
        const startTime = Date.now();
        console.log("selectTags start", tagName, pageSize);
        const db = SQLite.openDatabaseSync(dbName);
        const stmt = db.prepareSync('SELECT * FROM tags WHERE tagName LIKE ? ORDER BY tagName ASC LIMIT ?');
        const result = stmt.executeSync(`%${tagName}%`, pageSize).getAllSync();

        stmt.finalizeSync();
        db.closeSync();
        console.log("selectTags finished", `Elapsed time: ${(Date.now() - startTime) / 1000}s`);
        return result;
    },

    insertTag: (tagName, icon, creditType, creditAmount, startDay) => {
        const startTime = Date.now();
        console.log("insertTag start", tagName, icon, creditType, creditAmount, startDay);
        const db = SQLite.openDatabaseSync(dbName);
        const stmt = db.prepareSync('INSERT INTO tags (tagName, icon, creditType, creditAmount, startDay) VALUES (?, ?, ?, ?, ?)');
        stmt.executeSync(tagName, icon, creditType, creditAmount, startDay);

        stmt.finalizeSync();
        db.closeSync();
        EventBus.emit("tagsUpdated");
        console.log("insertTag finished", `Elapsed time: ${(Date.now() - startTime) / 1000}s`);
    },

    updateTag: (tagName, icon, creditType, creditAmount, startDay, id) => {
        const startTime = Date.now();
        console.log("updateTag start", tagName, icon, creditType, creditAmount, startDay, id);
        const db = SQLite.openDatabaseSync(dbName);
        const stmt = db.prepareSync('UPDATE tags SET tagName = ?, icon = ?, creditType = ?, creditAmount = ?, startDay = ? WHERE id = ?');
        stmt.executeSync(tagName, icon, creditType, creditAmount === '' ? null : creditAmount, startDay, id);

        stmt.finalizeSync();
        db.closeSync();
        EventBus.emit("tagsUpdated");
        console.log("updateTag finished", `Elapsed time: ${(Date.now() - startTime) / 1000}s`);
    },

    delTag: (id) => {
        const startTime = Date.now();
        console.log("delTag start", id);
        const db = SQLite.openDatabaseSync(dbName);
        const stmt = db.prepareSync('DELETE FROM tags WHERE id = ?');
        stmt.executeSync(id);

        stmt.finalizeSync();
        db.closeSync();
        EventBus.emit("tagsUpdated");
        console.log("delTag finished", `Elapsed time: ${(Date.now() - startTime) / 1000}s`);
    },

    selectIcons: () => {
        const startTime = Date.now();
        console.log("selectIcons start");
        const db = SQLite.openDatabaseSync(dbName);
        const stmt = db.prepareSync('SELECT * FROM icons');
        const result = stmt.executeSync().getAllSync();

        stmt.finalizeSync();
        db.closeSync();
        console.log("selectIcons finished", `Elapsed time: ${(Date.now() - startTime) / 1000}s`);
        return result;
    },

    insertIcon: (library, icon) => {
        const startTime = Date.now();
        console.log("insertIcon start", library, icon);
        const db = SQLite.openDatabaseSync(dbName);
        const stmt = db.prepareSync('INSERT INTO icons (library, icon) VALUES (?, ?)');
        stmt.executeSync(library, icon);

        stmt.finalizeSync();
        db.closeSync();
        console.log("insertIcon finished", `Elapsed time: ${(Date.now() - startTime) / 1000}s`);
    },

    delIcon: (library, icon) => {
        const startTime = Date.now();
        console.log("delIcon start", library, icon);
        const db = SQLite.openDatabaseSync(dbName);
        const stmt = db.prepareSync('DELETE FROM icons WHERE library = ? AND icon = ?');
        stmt.executeSync(library, icon);

        stmt.finalizeSync();
        db.closeSync();
        console.log("delIcon finished", `Elapsed time: ${(Date.now() - startTime) / 1000}s`);
    },

    delAllIcons: () => {
        const startTime = Date.now();
        console.log("delAllIcons start");
        const db = SQLite.openDatabaseSync(dbName);
        const stmt = db.prepareSync('DELETE FROM icons');
        stmt.executeSync();

        stmt.finalizeSync();
        db.closeSync();
        console.log("delAllIcons finished", `Elapsed time: ${(Date.now() - startTime) / 1000}s`);
    },

    selectTransactions: () => {
        const startTime = Date.now();
        console.log("selectTransactions start");
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
        console.log("selectTransactions finished", `Elapsed time: ${(Date.now() - startTime) / 1000}s`);
        return result;
    },

    insertTransaction: (transactionDate, description, amount, tags) => {
        const startTime = Date.now();
        console.log("insertTransaction start", transactionDate, description, amount, tags);
        const db = SQLite.openDatabaseSync(dbName);
        const stmt = db.prepareSync('INSERT INTO Transactions (TransactionDate, description, amount) VALUES (?, ?, ?)');
        const result = stmt.executeSync(transactionDate, description, amount);
        db.execSync('UPDATE Transactions SET sort_order = last_insert_rowid() WHERE id = last_insert_rowid();');
        const stmt2 = db.prepareSync('INSERT INTO TransactionTags (TransactionId, TagId) VALUES (?, ?)');
        tags.forEach(tagId => stmt2.executeSync(result.lastInsertRowId, tagId));

        stmt.finalizeSync();
        stmt2.finalizeSync();
        db.closeSync();
        EventBus.emit("transactionsUpdated");
        console.log("insertTransaction finished", `Elapsed time: ${(Date.now() - startTime) / 1000}s`);
    },
    updateTransaction: (id, transactionDate, description, amount, tags) => {
        const startTime = Date.now();
        console.log("updateTransaction start", id, transactionDate, description, amount, tags);
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
        console.log("updateTransaction finished", `Elapsed time: ${(Date.now() - startTime) / 1000}s`);
    },

    delTransaction: (id) => {
        const startTime = Date.now();
        console.log("delTransaction start", id);
        const db = SQLite.openDatabaseSync(dbName);

        const stmt = db.prepareSync('DELETE FROM Transactions WHERE id = ?');
        stmt.executeSync(id);

        const stmt2 = db.prepareSync('DELETE FROM TransactionTags WHERE TransactionId = ?');
        stmt2.executeSync(id);

        stmt.finalizeSync();
        stmt2.finalizeSync();
        db.closeSync();
        EventBus.emit("transactionsUpdated");
        console.log("delTransaction finished", `Elapsed time: ${(Date.now() - startTime) / 1000}s`);
    }
};

export default Database;
