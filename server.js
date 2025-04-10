const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const Message = require('./models/Message');
const Donation = require('./models/Donation');

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from "public/frontend"
app.use(express.static(path.join(__dirname, 'public/frontend')));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error(err));

// Handle form POST
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newMessage = new Message({ name, email, message });
    await newMessage.save();
    res.status(201).json({ message: 'Message received!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save message.' });
  }
});

// Handle donation POST
app.post('/api/donate', async (req, res) => {
  try {
    const { name, email, amount, message } = req.body;
    const newDonation = new Donation({ name, email, amount, message });
    await newDonation.save();
    res.status(201).json({ message: 'Thank you for your donation!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process donation.' });
  }
});

// Show messages (for admin)
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ date: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch messages.' });
  }
});

// Show donations (for admin)
app.get('/api/donations', async (req, res) => {
  try {
    const donations = await Donation.find().sort({ date: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch donations.' });
  }
});

// Get recent donations (public)
app.get('/api/recent-donations', async (req, res) => {
  try {
    const recentDonations = await Donation.find()
      .sort({ date: -1 })
      .limit(5)
      .select('name amount date message');
    res.json(recentDonations);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch recent donations.' });
  }
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
