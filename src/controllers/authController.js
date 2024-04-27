const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Create user
    user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
const jwt = require('jsonwebtoken');
const config = require('config');

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
    if (user.verified) {
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
