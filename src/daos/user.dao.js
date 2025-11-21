const userModel = require('../models/user.model');

class UserDao {
    async getAll() {
        return await userModel.find();
    }

    async getById(id) {
        return await userModel.findById(id);
    }

    async getByEmail(email) {
        return await userModel.findOne({ email });
    }

    async save(userData) {
        return await userModel.create(userData);
    }

    async update(id, userData) {
        return await userModel.findByIdAndUpdate(id, userData, { new: true });
    }
}

module.exports = new UserDao();