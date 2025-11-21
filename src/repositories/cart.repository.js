class CartRepository {
    constructor(dao) {
        this.dao = dao;
    }

    async save(cartData) {
        return await this.dao.save(cartData);
    }
    
    async getById(id) {
        return await this.dao.getById(id);
    }
}

module.exports = CartRepository;