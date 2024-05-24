const bcrypt = require('bcryptjs');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const express = require('express');
const router = express.Router();
console.log(process.env.passkey)


const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  service: 'SendGrid',
  auth: {
    
    user: 'apikey', // SendGrid API key
    pass: process.env.passkey}

 
  // auth: {
  //   user: 'grocbidder@gmail.com',
  //   pass: 'wdvpdzeduysfqpjw'
  // }
});

exports.register = async (req, res) => {
  try {
    const { name, email, password,address } = req.body;
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Create user
    const verificationToken = require('crypto').randomBytes(32).toString('hex');

    user = new User({ name, email, password: hashedPassword ,address,verificationToken});
    await user.save();
    const verificationLink = `https://groceries-i18z.onrender.com/api/auth/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
      from:"welcome@grocbidder.online",
      to: email,
      subject: 'Email Verification',
      html: `<h2>Email Verification</h2>
             <p>Click the link below to verify your email:</p>
             <a href="${verificationLink}">${verificationLink}</a>`
    });
    res.json({ message: 'User registered successfully Please check your email to verify your account.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
const jwt = require('jsonwebtoken');
const config = require('config');

exports.verify = async (req, res) => {
  try {
    const { token } = req.query;
    
    // Find user by verification token
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }
    
    // Mark user as verified
    user.verified = true;
    user.verificationToken = null;
    await user.save();
    
    res.status(200).json({ message: 'Email verified successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // Check if user is verified
    if (!user.verified) {
      return res.status(400).json({ message: 'Email not verified' });
    }
    // Generate JWT token
    const payload = { user: { id: user.id } };
    jwt.sign(payload, config.get('jwtSecret'), { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ 'token':token,
                'id':user.id,
                'name':user.name,
                'email':user.email
               });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
