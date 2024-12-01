const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'priyansh',
    database: 'blog_app',
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        process.exit(1);
    }
    console.log('Connected to MySQL database');
});

// Middleware for JWT authentication
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, 'secret_key', (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Routes

// Sign Up
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    // Check if the user already exists
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) return res.status(400).json({ error: 'Email is already registered' });

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert the new user into the database
        db.query(
            'INSERT INTO users (username, email, passwordHash) VALUES (?, ?, ?)',
            [username, email, hashedPassword],
            (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ message: 'User registered successfully!' });
            }
        );
    });
});

// Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err || results.length === 0) return res.status(400).json({ error: 'Invalid email or password' });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

        const token = jwt.sign({ id: user.id }, 'secret_key', { expiresIn: '1h' });
        res.json({ token });
    });
});

// Post a Blog
app.post('/blogs', authenticateToken, (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    db.query(
        'INSERT INTO blogs (userId, title, content, createdAt) VALUES (?, ?, ?, NOW())',
        [req.user.id, title, content],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Blog posted successfully!' });
        }
    );
});

// Get All Blogs
app.get('/blogs', (req, res) => {
    db.query(
        `SELECT blogs.id, blogs.title, blogs.content, blogs.createdAt, users.username 
         FROM blogs 
         JOIN users ON blogs.userId = users.id`,
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        }
    );
});

// Start server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
