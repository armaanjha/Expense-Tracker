// server.js — Main Express server
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const db = require('./db');
const path = require('path');

const app = express();
const PORT = 3000;

// ─────────────────────────────────────────
//  MIDDLEWARE
// ─────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'expense_tracker_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

// Auth middleware — protects routes
function requireLogin(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Please login first' });
    }
    next();
}

// ─────────────────────────────────────────
//  PAGES
// ─────────────────────────────────────────
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    if (!req.session.userId) return res.redirect('/');
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// ─────────────────────────────────────────
//  AUTH ROUTES
// ─────────────────────────────────────────

// POST /register — create new user
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ error: 'Username and password required' });

    const hashed = bcrypt.hashSync(password, 10);
    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(sql, [username, hashed], (err) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY')
                return res.status(400).json({ error: 'Username already exists' });
            return res.status(500).json({ error: 'Registration failed' });
        }
        res.json({ message: 'Registered successfully! Please login.' });
    });
});

// POST /login — login user
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) return res.status(500).json({ error: 'Login failed' });
        if (results.length === 0)
            return res.status(401).json({ error: 'Invalid username or password' });

        const user = results[0];
        if (!bcrypt.compareSync(password, user.password))
            return res.status(401).json({ error: 'Invalid username or password' });

        req.session.userId = user.id;
        req.session.username = user.username;
        res.json({ message: 'Login successful', username: user.username });
    });
});

// POST /logout
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logged out' });
});

// GET /me — get logged in user info
app.get('/me', requireLogin, (req, res) => {
    res.json({ username: req.session.username });
});

// ─────────────────────────────────────────
//  EXPENSE ROUTES
// ─────────────────────────────────────────

// GET /expenses — get all expenses for logged in user
// Optional query params: ?category=Food&from=2024-01-01&to=2024-12-31
app.get('/expenses', requireLogin, (req, res) => {
    const { category, from, to } = req.query;
    let sql = 'SELECT * FROM expenses WHERE user_id = ?';
    const params = [req.session.userId];

    if (category) {
        sql += ' AND category = ?';
        params.push(category);
    }
    if (from) {
        sql += ' AND date >= ?';
        params.push(from);
    }
    if (to) {
        sql += ' AND date <= ?';
        params.push(to);
    }

    sql += ' ORDER BY date DESC';
    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch expenses' });
        res.json(results);
    });
});

// POST /expenses — add new expense
app.post('/expenses', requireLogin, (req, res) => {
    const { title, amount, category, date } = req.body;
    if (!title || !amount || !category || !date)
        return res.status(400).json({ error: 'All fields are required' });

    const sql = 'INSERT INTO expenses (user_id, title, amount, category, date) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [req.session.userId, title, amount, category, date], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to add expense' });
        res.json({ message: 'Expense added', id: result.insertId });
    });
});

// DELETE /expenses/:id — delete an expense
app.delete('/expenses/:id', requireLogin, (req, res) => {
    const sql = 'DELETE FROM expenses WHERE id = ? AND user_id = ?';
    db.query(sql, [req.params.id, req.session.userId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to delete expense' });
        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'Expense not found' });
        res.json({ message: 'Expense deleted' });
    });
});

// GET /expenses/summary — total spent + per category breakdown
app.get('/expenses/summary', requireLogin, (req, res) => {
    const sql = `
        SELECT 
            category,
            COUNT(*) AS count,
            SUM(amount) AS total
        FROM expenses
        WHERE user_id = ?
        GROUP BY category
        ORDER BY total DESC
    `;
    db.query(sql, [req.session.userId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch summary' });

        const grandTotal = results.reduce((sum, row) => sum + parseFloat(row.total), 0);
        res.json({ grandTotal: grandTotal.toFixed(2), breakdown: results });
    });
});

// ─────────────────────────────────────────
//  START SERVER
// ─────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`Expense Tracker running at http://localhost:${PORT}`);
});
