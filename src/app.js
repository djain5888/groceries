const express = require('express');
const connectDB = require('./utils/connectDB');
const authRoutes = require('./routes/authRoutes');
const groceryRoutes = require('./routes/groceries');
// const listingsRouter = require('./routes/listings');



// Connect to MongoDB
connectDB();

const app = express();
const cors = require('cors');

// const app = express();
app.use(cors());

// Your other API routes...

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/groceries', groceryRoutes);
//app.use('/api', listingsRouter);
 // Use grocery routes


module.exports = app;

