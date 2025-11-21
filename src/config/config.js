const dotenv = require('dotenv');


dotenv.config();

module.exports = {
    port: process.env.PORT || 8080,
    mongo_url: process.env.MONGO_URL,
    jwt_secret: process.env.JWT_SECRET
    
};