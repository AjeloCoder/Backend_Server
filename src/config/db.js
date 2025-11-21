const mongoose = require('mongoose');
const config = require('./config');

class MongoSingleton {
    static #instance;

    constructor() {
        mongoose.connect(config.mongo_url, {
         
        })
        .then(() => {
            console.log('Conectado a MongoDB con éxito');
        })
        .catch((error) => {
            console.error('Error al conectar a la BD:', error);
        });
    }

    static getInstance() {
        if (this.#instance) {
            console.log('La conexión a la base de datos ya existe');
            return this.#instance;
        }

        console.log('Creando nueva conexión a la base de datos...');
        this.#instance = new MongoSingleton();
        return this.#instance;
    }
}

module.exports = MongoSingleton;