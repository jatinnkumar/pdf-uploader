// middlewares/jwtAuth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    // Check if token is provided
    if (!authHeader) {
        return res.status(401).json({ message: 'Access token missing or invalid' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify token
        const decoded = jwt.verify(token, 'jwt_secret'); // Use a secure secret
        req.user = decoded; // Attach user info to request object
        next(); // Proceed to next middleware or route handler
    } catch (err) {
        return res.status(403).json({ message: 'Token verification failed' });
    }
};

const generateToken = (payload) => {
    return jwt.sign(payload, 'jwt_secret');
}

module.exports = { jwtAuth, generateToken };
