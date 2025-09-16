const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();

app.use(cors({ origin: '*' })); // Allow all origins for testing
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// SQLite Database Setup
const db = new sqlite3.Database('database.db', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite database');
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'user'
    )`, (err) => {
        if (err) console.error('Error creating users table:', err.message);
    });
    db.run(`CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        author TEXT,
        price REAL,
        stock INTEGER DEFAULT 10
    )`, (err) => {
        if (err) console.error('Error creating books table:', err.message);
    });
    db.run(`INSERT OR IGNORE INTO books (title, author, price, stock) VALUES
        ('The Great Gatsby', 'F. Scott Fitzgerald', 9.99, 10),
        ('1984', 'George Orwell', 12.99, 10),
        ('Pride and Prejudice', 'Jane Austen', 7.99, 10),
        ('To Kill a Mockingbird', 'Harper Lee', 8.99, 10),
        ('The Catcher in the Rye', 'J.D. Salinger', 10.49, 10),
        ('Brave New World', 'Aldous Huxley', 11.99, 10),
        ('Lord of the Flies', 'William Golding', 9.49, 10),
        ('The Hobbit', 'J.R.R. Tolkien', 14.99, 10),
        ('Fahrenheit 451', 'Ray Bradbury', 8.79, 10),
        ('Jane Eyre', 'Charlotte Brontë', 7.49, 10),
        ('Animal Farm', 'George Orwell', 6.99, 10),
        ('Wuthering Heights', 'Emily Brontë', 7.29, 10),
        ('The Grapes of Wrath', 'John Steinbeck', 12.49, 10),
        ('Moby-Dick', 'Herman Melville', 10.99, 10),
        ('Catch-22', 'Joseph Heller', 11.49, 10),
        ('The Bell Jar', 'Sylvia Plath', 9.99, 10),
        ('Slaughterhouse-Five', 'Kurt Vonnegut', 10.29, 10),
        ('A Tale of Two Cities', 'Charles Dickens', 8.49, 10),
        ('The Odyssey', 'Homer', 9.79, 10),
        ('Frankenstein', 'Mary Shelley', 6.99, 10)`, (err) => {
        if (err) console.error('Error seeding books:', err.message);
    });
    db.run(`CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT,
        book_id INTEGER,
        quantity INTEGER DEFAULT 1
    )`, (err) => {
        if (err) console.error('Error creating cart table:', err.message);
    });
});

const SECRET_KEY = 'your-secret-key'; // Replace with a secure key in production

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token' });
        req.user = user;
        next();
    });
};

// Me endpoint to get user info
app.get('/me', authenticateToken, (req, res) => {
    db.get('SELECT role FROM users WHERE email = ?', [req.user.email], (err, user) => {
        if (err) {
            console.error('Database error during /me:', err.message);
            return res.status(500).json({ message: 'Server error' });
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ role: user.role });
    });
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                console.error('Database error during login:', err.message);
                return res.status(500).json({ message: 'Server error' });
            }
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ message: 'Invalid password' });
            }
            const token = jwt.sign({ email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
            res.json({ token });
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Registration endpoint (user)
app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                console.error('Database error during registration:', err.message);
                return res.status(500).json({ message: 'Server error' });
            }
            if (user) {
                return res.status(400).json({ message: 'User already exists' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            db.run('INSERT INTO users (email, password, role) VALUES (?, ?, "user")', [email, hashedPassword], (err) => {
                if (err) {
                    console.error('Error inserting user:', err.message);
                    return res.status(500).json({ message: 'Error registering user' });
                }
                res.json({ success: true });
            });
        });
    } catch (error) {
        console.error('Registration error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Registration endpoint
app.post('/admin/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                console.error('Database error during admin registration:', err.message);
                return res.status(500).json({ message: 'Server error' });
            }
            if (user) {
                return res.status(400).json({ message: 'User already exists' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            db.run('INSERT INTO users (email, password, role) VALUES (?, ?, "admin")', [email, hashedPassword], (err) => {
                if (err) {
                    console.error('Error inserting admin:', err.message);
                    return res.status(500).json({ message: 'Error registering admin' });
                }
                res.json({ success: true });
            });
        });
    } catch (error) {
        console.error('Admin registration error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Books endpoint
app.get('/books', authenticateToken, (req, res) => {
    db.all('SELECT * FROM books', [], (err, books) => {
        if (err) {
            console.error('Error retrieving books:', err.message);
            return res.status(500).json({ message: 'Error retrieving books' });
        }
        console.log('Books fetched:', books); // Debug books
        res.json(books);
    });
});

// Search endpoint
app.get('/search', authenticateToken, (req, res) => {
    const query = req.query.query || '';
    db.all('SELECT * FROM books WHERE title LIKE ? OR author LIKE ?', [`%${query}%`, `%${query}%`], (err, books) => {
        if (err) {
            console.error('Error searching books:', err.message);
            return res.status(500).json({ message: 'Error searching books' });
        }
        console.log('Search results:', books); // Debug search
        res.json(books);
    });
});

// Add book endpoint (admin only)
app.post('/add-book', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    const { title, author, price, stock } = req.body;
    db.run('INSERT INTO books (title, author, price, stock) VALUES (?, ?, ?, ?)', [title, author, price, stock], (err) => {
        if (err) {
            console.error('Error adding book:', err.message);
            return res.status(500).json({ message: 'Error adding book' });
        }
        res.json({ success: true });
    });
});

// Delete book endpoint (admin only)
app.delete('/delete-book/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    const id = req.params.id;
    db.run('DELETE FROM books WHERE id = ?', [id], (err) => {
        if (err) {
            console.error('Error deleting book:', err.message);
            return res.status(500).json({ message: 'Error deleting book' });
        }
        res.json({ success: true });
    });
});

// Add to cart endpoint
app.post('/add-to-cart', authenticateToken, async (req, res) => {
    const { book_id, quantity } = req.body;
    const user_email = req.user.email;
    db.get('SELECT * FROM cart WHERE user_email = ? AND book_id = ?', [user_email, book_id], (err, item) => {
        if (err) {
            console.error('Error checking cart:', err.message);
            return res.status(500).json({ message: 'Server error' });
        }
        if (item) {
            db.run('UPDATE cart SET quantity = quantity + ? WHERE user_email = ? AND book_id = ?', [quantity || 1, user_email, book_id], (err) => {
                if (err) {
                    console.error('Error updating cart:', err.message);
                    return res.status(500).json({ message: 'Error updating cart' });
                }
                res.json({ success: true });
            });
        } else {
            db.run('INSERT INTO cart (user_email, book_id, quantity) VALUES (?, ?, ?)', [user_email, book_id, quantity || 1], (err) => {
                if (err) {
                    console.error('Error adding to cart:', err.message);
                    return res.status(500).json({ message: 'Error adding to cart' });
                }
                res.json({ success: true });
            });
        }
    });
});

// Get cart endpoint
app.get('/cart', authenticateToken, (req, res) => {
    const user_email = req.user.email;
    db.all('SELECT cart.*, books.title, books.author, books.price FROM cart JOIN books ON cart.book_id = books.id WHERE user_email = ?', [user_email], (err, items) => {
        if (err) {
            console.error('Error retrieving cart:', err.message);
            return res.status(500).json({ message: 'Error retrieving cart' });
        }
        res.json(items);
    });
});

// Remove from cart endpoint
app.delete('/remove-from-cart/:book_id', authenticateToken, (req, res) => {
    const user_email = req.user.email;
    const book_id = req.params.book_id;
    db.run('DELETE FROM cart WHERE user_email = ? AND book_id = ?', [user_email, book_id], (err) => {
        if (err) {
            console.error('Error removing from cart:', err.message);
            return res.status(500).json({ message: 'Error removing from cart' });
        }
        res.json({ success: true });
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));