const mongoose = require('mongoose');

const cartCollection = 'carts';

const cartSchema = new mongoose.Schema({
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products' 
            },
            quantity: {
                type: Number,
                default: 1
            }
        }
    ]
}, { timestamps: true }); 

cartSchema.pre('findOne', function() {
    this.populate('products.product');
});

const cartModel = mongoose.model(cartCollection, cartSchema);

module.exports = cartModel;