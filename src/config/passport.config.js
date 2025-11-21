const passport = require('passport');
const jwt = require('passport-jwt');
const config = require('./config');

const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;


const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['coderCookieToken']; 
    }
    return token;
};

const initializePassport = () => {
    passport.use(
        'jwt',
        new JWTStrategy(
            {
                
                jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor, ExtractJWT.fromAuthHeaderAsBearerToken()]),
                secretOrKey: config.jwt_secret
            },
            async (jwt_payload, done) => {
                try {
                    return done(null, jwt_payload);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );
};

module.exports = initializePassport;