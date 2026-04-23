const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Atlas connection
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  console.error('MONGODB_URI is not set. Configure it in Render Environment variables.');
} else {
  mongoose
    .connect(mongoURI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((err) => console.error('MongoDB connection error:', err.message));
}

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Middleware
app.use(cors()); // Allow all origins (or specify your frontend URL)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Root URL (browsers do GET /); without this, Express returns "Cannot GET /"
app.get('/', (req, res) => {
  res.type('html');
  res.send(
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>API</title></head><body>' +
      '<h1>Backend is running</h1>' +
      '<p>API endpoints: <code>POST /api/register</code>, <code>POST /api/login</code>. ' +
      'Health: <a href="/health">/health</a>.</p>' +
      '</body></html>'
  );
});

// API Routes
// Register API
app.post('/api/register', async (req, res) => {
  try {
    const { username, firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.json({ success: false, message: 'Username already exists' });
    }

    const newUser = new User({ username, firstName, lastName, email, password });
    await newUser.save();

    res.json({ success: true, message: 'Registration successful' });
  } catch (error) {
    res.json({ success: false, message: 'Registration failed' });
  }
});

// Login API
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username, password });
    if (!user) {
      return res.json({ success: false, message: 'Invalid username or password' });
    }

    res.json({ success: true, message: 'Login successful', username: user.username });
  } catch (error) {
    res.json({ success: false, message: 'Login failed' });
  }
});

const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.use((req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  console.log('Frontend build folder not found. API-only mode enabled.');
}
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
