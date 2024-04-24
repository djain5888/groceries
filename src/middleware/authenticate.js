// authenticate.js

const jwt = require('jsonwebtoken');
const config=require('config')

function authenticate(req, res, next) {
  // Get the token from the request header or query string
  const token = req.headers.authorization || req.query.token;

  // Check if token is provided
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  //console.log(token)
  try {
    // Verify the token
    // console.log(jwt.verify(token, config.get('jwtSecret')))
    const parsedToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    //console.log(config.get('jwtSecret'))
    //console.log(parsedToken)
    
    const decoded = jwt.verify(parsedToken, config.get('jwtSecret'));
    
    // // Attach user information to the request object for further use
    req.user = decoded.user;
    next(); // Call the next middleware function
  }
   catch (err) {
    console.log(err)
    // If token is invalid or expired, return an error
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = { authenticate };
