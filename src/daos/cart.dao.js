const cartModel = require('../models/cart.model');

class CartDao {
    async getAll() {
        return await cartModel.find();
    }

    async getById(id) {
        return await cartModel.findById(id);
    }

    // EL MÉTODO CLAVE: Debe llamarse 'save'
    async save(cartData = { products: [] }) {
        return await cartModel.create(cartData);
    }

    async update(id, cartData) {
        return await cartModel.findByIdAndUpdate(id, cartData, { new: true });
    }
}

module.exports = new CartDao();