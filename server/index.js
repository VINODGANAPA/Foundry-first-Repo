const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { initializeDatabase, createAppointment, listAppointments } = require('./db');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Initialize DB
initializeDatabase();

// API routes
app.get('/api/health', (req, res) => {
	res.json({ ok: true, message: 'IVF app running' });
});

app.get('/api/appointments', async (req, res) => {
	try {
		const rows = await listAppointments();
		res.json(rows);
	} catch (err) {
		res.status(500).json({ error: 'Failed to list appointments', details: err.message });
	}
});

app.post('/api/appointments', async (req, res) => {
	try {
		const { name, email, phone, preferred_date, message } = req.body || {};
		if (!name || !email || !preferred_date) {
			return res.status(400).json({ error: 'name, email, preferred_date are required' });
		}
		const result = await createAppointment({ name, email, phone, preferred_date, message });
		res.status(201).json({ id: result.id });
	} catch (err) {
		res.status(500).json({ error: 'Failed to create appointment', details: err.message });
	}
});

// SPA fallback for non-API requests
app.use((req, res, next) => {
	if (req.path.startsWith('/api/')) return next();
	res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});