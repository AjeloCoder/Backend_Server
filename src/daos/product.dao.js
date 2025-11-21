const productModel = require('../models/product.model');

class ProductDao {
    async getAll() {
        return await productModel.find();
    }

    async getById(id) {
        return await productModel.findById(id);
    }

    async save(productData) {
        return await productModel.create(productData);
    }

    async update(id, productData) {
        return await productModel.findByIdAndUpdate(id, productData, { new: true });
    }

    async delete(id) {
        return await productModel.findByIdAndDelete(id);
    }
}

module.exports = new ProductDao();