import * as SQLite from 'expo-sqlite';

const dbName = 'Budget';

const Database = {
    initializeDatabase: () => {
        const db = SQLite.openDatabaseSync(dbName);

        db.execSync('CREATE TABLE IF NOT EXISTS tags (id INTEGER PRIMARY KEY AUTOINCREMENT, tagName TEXT UNIQUE, icon TEXT);');
        /*const columns = db.getAllSync(`PRAGMA table_info(tags);`).map((col) => col.name);
        if (!columns.includes('icon')) {
            db.execSync('ALTER TABLE tags ADD COLUMN icon TEXT;');
        }
*/
        db.execSync('CREATE TABLE IF NOT EXISTS icons (id INTEGER PRIMARY KEY AUTOINCREMENT, library TEXT, icon TEXT);');

        db.execSync('CREATE TABLE IF NOT EXISTS Transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, TransactionDate datetime, description TEXT, amount money);');
        db.execSync('CREATE TABLE IF NOT EXISTS TransactionTags (id INTEGER PRIMARY KEY AUTOINCREMENT, TransactionId INTEGER, TagId INTEGER);');

        db.closeSync();
    },

    selectTags: (tagName, pageSize) => {
        const db = SQLite.openDatabaseSync(dbName);
        const stmt = db.prepareSync('SELECT * FROM tags WHERE tagName LIKE ? ORDER BY tagName ASC LIMIT ?');
        const result = stmt.executeSync(`%${tagName}%`, pageSize).getAllSync();

        stmt.finalizeSync();
        db.closeSync();
        return result;
    },

    insertTag: (tagName, icon) => {
        const db = SQLite.openDatabaseSync(dbName);
        const stmt = db.prepareSync('INSERT INTO tags (tagName, icon) VALUES (?, ?)');
        stmt.executeSync(tagName, icon);

        stmt.finalizeSync();
        db.closeSync();
    },

    updateTag: (tagName, icon, id) => {
        const db = SQLite.openDatabaseSync(dbName);
        const stmt = db.prepareSync('UPDATE tags SET tagName = ?, icon = ? WHERE id = ?');
        stmt.executeSync(tagName, icon, id);

        stmt.finalizeSync();
        db.closeSync();
    },

    delTag: (id) => {
        const db = SQLite.openDatabaseSync(dbName);
        const stmt = db.prepareSync('DELETE FROM tags WHERE id = ?');
        stmt.executeSync(id);

        stmt.finalizeSync();
        db.closeSync();
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
        const stmt = db.prepareSync('SELECT * FROM Transactions');
        const rows = stmt.executeSync().getAllSync();

        const stmt2 = db.prepareSync('SELECT t.* FROM TransactionTags tt INNER JOIN Tags t on t.id = tt.TagId where tt.TransactionId = ?');
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
        const stmt2 = db.prepareSync('INSERT INTO TransactionTags (TransactionId, TagId) VALUES (?, ?)');
        tags.forEach((tagId) => stmt2.executeSync(result.lastInsertRowId, tagId));

        stmt.finalizeSync();
        stmt2.finalizeSync();
        db.closeSync();
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
    }
};

export default Database;
