const { Router } = require('express');
const passport = require('passport');
const authorization = require('../middlewares/auth.middleware');
const cartsController = require('../controllers/carts.controller');

const router = Router();

// Endpoint para agregar productos al carrito (Solo USER puede hacerlo)
// POST /api/carts/:cid/products/:pid
router.post('/:cid/products/:pid', 
    passport.authenticate('jwt', { session: false }),
    authorization('user'), 
    cartsController.addProductToCart
);

// Endpoint para finalizar compra (Ticket)
// POST /api/carts/:cid/purchase
router.post('/:cid/purchase', 
    passport.authenticate('jwt', { session: false }),
    cartsController.purchaseCart
);

module.exports = router;