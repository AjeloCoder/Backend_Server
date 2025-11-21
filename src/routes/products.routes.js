const { Router } = require('express');
const passport = require('passport');
const authorization = require('../middlewares/auth.middleware'); 
const productController = require('../controllers/products.controller');

const router = Router();


router.get('/', productController.getProducts);


router.post('/', 
    passport.authenticate('jwt', { session: false }), 
    authorization('admin'),                          
    productController.createProduct                   
);

router.put('/:pid', 
    passport.authenticate('jwt', { session: false }),
    authorization('admin'),
    productController.updateProduct
);
module.exports = router;