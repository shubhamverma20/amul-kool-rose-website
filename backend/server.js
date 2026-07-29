require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and body parsing
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to SQLite database at:', dbPath);
        initDatabase();
    }
});

// Create tables if they do not exist
function initDatabase() {
    db.serialize(() => {
        // Contacts Table
        db.run(`
            CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) console.error('Error creating contacts table:', err.message);
        });

        // Reviews Table
        db.run(`
            CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                rating REAL NOT NULL,
                comment TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('Error creating reviews table:', err.message);
            } else {
                seedDummyReviews();
            }
        });
    });
}

// Seed dummy reviews if the table is empty
function seedDummyReviews() {
    db.get('SELECT COUNT(*) AS count FROM reviews', [], (err, row) => {
        if (err) {
            console.error('Error checking review count:', err.message);
            return;
        }

        if (row.count === 0) {
            console.log('Database empty. Seeding 3 default dummy reviews...');
            const dummyReviews = [
                {
                    name: 'Ananya M.',
                    rating: 5.0,
                    comment: 'The rose flavor is so authentic. It reminds me of the homemade rose milk my grandmother used to make. Super refreshing!'
                },
                {
                    name: 'Rahul K.',
                    rating: 4.0,
                    comment: 'Perfect level of sweetness. I carry one for my post-gym cooldown. Amul Kool never fails to deliver quality.'
                },
                {
                    name: 'Sanya P.',
                    rating: 4.8,
                    comment: 'I love how smooth the texture is. The glass bottle look makes it feel so premium. Five stars for the Rose flavor!'
                }
            ];

            const stmt = db.prepare('INSERT INTO reviews (name, rating, comment) VALUES (?, ?, ?)');
            dummyReviews.forEach(review => {
                stmt.run(review.name, review.rating, review.comment);
            });
            stmt.finalize(() => {
                console.log('Successfully seeded database reviews.');
            });
        }
    });
}

// --- API ROUTES ---

// POST /api/contact - Submit contact form
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Please provide name, email, and message.' });
    }

    const query = `INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)`;
    db.run(query, [name, email, message], function(err) {
        if (err) {
            console.error('Database error in /api/contact:', err.message);
            return res.status(500).json({ error: 'Failed to save contact message.' });
        }
        
        console.log(`[Contact Form] Submitted by ${name} (${email}): "${message}"`);
        res.status(201).json({ 
            success: true, 
            message: 'Contact form submitted successfully!',
            id: this.lastID 
        });
    });
});

// GET /api/reviews - Fetch all reviews
app.get('/api/reviews', (req, res) => {
    const query = `SELECT * FROM reviews ORDER BY created_at DESC`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Database error in GET /api/reviews:', err.message);
            return res.status(500).json({ error: 'Failed to fetch reviews.' });
        }
        res.json(rows);
    });
});

// POST /api/reviews - Submit a new review
app.post('/api/reviews', (req, res) => {
    const { name, rating, comment } = req.body;

    if (!name || !rating || !comment) {
        return res.status(400).json({ error: 'Please provide name, rating, and comment.' });
    }

    const numericRating = parseFloat(rating);
    if (isNaN(numericRating) || numericRating < 1.0 || numericRating > 5.0) {
        return res.status(400).json({ error: 'Rating must be a number between 1.0 and 5.0.' });
    }

    const query = `INSERT INTO reviews (name, rating, comment) VALUES (?, ?, ?)`;
    db.run(query, [name, numericRating, comment], function(err) {
        if (err) {
            console.error('Database error in POST /api/reviews:', err.message);
            return res.status(500).json({ error: 'Failed to save review.' });
        }
        
        const newReviewId = this.lastID;
        console.log(`[New Review] Submitted by ${name}: ${numericRating} Stars - "${comment}"`);
        
        // Return the newly created review
        db.get(`SELECT * FROM reviews WHERE id = ?`, [newReviewId], (err, row) => {
            if (err) {
                return res.status(201).json({ id: newReviewId, name, rating: numericRating, comment });
            }
            res.status(201).json(row);
        });
    });
});



// Start backend server
app.listen(PORT, () => {
    console.log(`Backend Express server is running on http://localhost:${PORT}`);
});
