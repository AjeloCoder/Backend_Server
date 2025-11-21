const jwt = require('jsonwebtoken');
const config = require('../config/config'); 

const generateToken = (user) => {
    return jwt.sign({ id: user._id, email: user.email, role: user.role }, config.jwt_secret, { expiresIn: '24h' });
};

module.exports = {
    generateToken
};