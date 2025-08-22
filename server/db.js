const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbFilePath = path.join(__dirname, '..', 'db', 'ivf_app.db');
const database = new sqlite3.Database(dbFilePath);

// Initialize schema
const initializeDatabase = () => {
	database.serialize(() => {
		database.run(
			`CREATE TABLE IF NOT EXISTS appointments (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				name TEXT NOT NULL,
				email TEXT NOT NULL,
				phone TEXT,
				preferred_date TEXT NOT NULL,
				message TEXT,
				created_at TEXT DEFAULT (datetime('now'))
			)`
		);
	});
};

// CRUD helpers
const createAppointment = ({ name, email, phone, preferred_date, message }) => {
	return new Promise((resolve, reject) => {
		database.run(
			`INSERT INTO appointments (name, email, phone, preferred_date, message) VALUES (?, ?, ?, ?, ?)`,
			[name, email, phone || null, preferred_date, message || null],
			function (err) {
				if (err) return reject(err);
				resolve({ id: this.lastID });
			}
		);
	});
};

const listAppointments = () => {
	return new Promise((resolve, reject) => {
		database.all(
			`SELECT id, name, email, phone, preferred_date, message, created_at FROM appointments ORDER BY created_at DESC`,
			[],
			(err, rows) => {
				if (err) return reject(err);
				resolve(rows);
			}
		);
	});
};

module.exports = {
	database,
	initializeDatabase,
	createAppointment,
	listAppointments,
};