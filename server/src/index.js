import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new Database('/workspace/server/data.sqlite');

db.pragma('journal_mode = WAL');

db.exec(`
	CREATE TABLE IF NOT EXISTS appointments (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		full_name TEXT NOT NULL,
		email TEXT NOT NULL,
		phone TEXT,
		preferred_date TEXT NOT NULL,
		preferred_time TEXT NOT NULL,
		reason TEXT,
		created_at TEXT NOT NULL
	);
`);

const appointmentSchema = z.object({
	full_name: z.string().min(2),
	email: z.string().email(),
	phone: z.string().optional(),
	preferred_date: z.string(),
	preferred_time: z.string(),
	reason: z.string().max(1000).optional(),
});

app.get('/api/health', (_req, res) => {
	res.json({ status: 'ok' });
});

app.get('/api/appointments', (_req, res) => {
	const rows = db.prepare('SELECT * FROM appointments ORDER BY id DESC').all();
	res.json(rows);
});

app.post('/api/appointments', (req, res) => {
	const parse = appointmentSchema.safeParse(req.body);
	if (!parse.success) {
		return res.status(400).json({ error: 'Invalid data', details: parse.error.flatten() });
	}
	const { full_name, email, phone, preferred_date, preferred_time, reason } = parse.data;
	const createdAt = new Date().toISOString();
	const stmt = db.prepare(`
		INSERT INTO appointments (full_name, email, phone, preferred_date, preferred_time, reason, created_at)
		VALUES (@full_name, @email, @phone, @preferred_date, @preferred_time, @reason, @created_at)
	`);
	const info = stmt.run({ full_name, email, phone: phone || null, preferred_date, preferred_time, reason: reason || null, created_at: createdAt });
	const inserted = db.prepare('SELECT * FROM appointments WHERE id = ?').get(info.lastInsertRowid);
	res.status(201).json(inserted);
});

app.delete('/api/appointments/:id', (req, res) => {
	const id = Number(req.params.id);
	if (!Number.isInteger(id) || id <= 0) {
		return res.status(400).json({ error: 'Invalid id' });
	}
	const info = db.prepare('DELETE FROM appointments WHERE id = ?').run(id);
	if (info.changes === 0) {
		return res.status(404).json({ error: 'Not found' });
	}
	res.status(204).send();
});

// Static client serving (production)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.use((req, res, next) => {
	if (req.path.startsWith('/api')) return next();
	if (req.method !== 'GET') return next();
	res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});