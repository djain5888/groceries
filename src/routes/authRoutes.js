const express = require('express');
const router = express.Router();
// const { register } = require('../controllers/authController');

// router.post('/register', register);

// module.exports = router;

//const express = require('express');
// const router = express.Router();
const { register, login, verify } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email',verify)

module.exports = router;
