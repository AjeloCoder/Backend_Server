const { Router } = require('express');
const passport = require('passport');
const authController = require('../controllers/auth.controller');

const router = Router();

router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/current', passport.authenticate('jwt', { session: false }), authController.current);

router.post('/logout', authController.logout);

router.post('/forgot-password', authController.forgotPassword);

router.post('/reset-password', authController.resetPassword);

module.exports = router;