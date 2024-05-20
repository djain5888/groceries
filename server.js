const express = require('express');
const cors = require('cors'); 
const mongoose = require('mongoose');
require('dotenv').config();




const app = require('./src/app');
app.use(cors());
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); // Replace '*' with your frontend URL for production
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     next();
//   });


const PORT = process.env.PORT || 3000;


// Connect to MongoDB using the recommended connection string format
const mongoURI = 'mongodb+srv://djain5888:Deepak%40321@cluster0.jb66uqs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

// Remove deprecated options and enable automatic indexing with a clear warning'
// mongoose.connect(mongoURI)
//   .then(() => {
//     console.log('MongoDB connected...');

//     // **Important:** Consider explicit index creation for performance optimization
//     console.warn('For optimal performance, consider creating indexes explicitly based on your application\'s query patterns.');
//   })
//   .catch((err) => console.error(err));


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
