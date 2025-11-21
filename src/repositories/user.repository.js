const UserDTO = require('../dtos/user.dto');

class UserRepository {
    constructor(dao) {
        this.dao = dao;
    }

    async getAll() {
        return await this.dao.getAll();
    }

    async getByEmail(email) {
        return await this.dao.getByEmail(email);
    }

    async getById(id) {
        return await this.dao.getById(id);
    }

    async create(userData) {
        return await this.dao.save(userData);
    }

    async update(id, userData) {
        return await this.dao.update(id, userData);
    }
    
    
    async getUserCurrent(id) {
        const user = await this.dao.getById(id);
        if (!user) return null;
        return new UserDTO(user);
    }
}

module.exports = UserRepository;