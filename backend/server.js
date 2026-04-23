const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Atlas connection
const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.log('MongoDB connection error:', err));

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

app.use(express.static(path.join(__dirname,'frontend','dist')));

app.use((req, res)=>{
    res.sendFile(path.join(__dirname, 'frontend','dist','index.html'));
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
