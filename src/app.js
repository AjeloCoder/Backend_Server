const express = require('express');
const cookieParser = require('cookie-parser'); // <--- Importar
const passport = require('passport'); // <--- Importar
const initializePassport = require('./config/passport.config'); // <--- Importar
const MongoSingleton = require('./config/db');
const config = require('./config/config');
const authRouter = require('./routes/auth.routes');
const productsRouter = require('./routes/products.routes');
const cartsRouter = require('./routes/carts.routes');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // <--- Para leer cookies

// Inicializar Base de Datos
MongoSingleton.getInstance();

// Inicializar Passport
initializePassport(); // <--- Configura las estrategias
app.use(passport.initialize()); // <--- Inicia passport
app.use('/api/sessions', authRouter);
app.use('/api/products', productsRouter); 
app.use('/api/carts', cartsRouter);

// ... tus rutas ...
// (Opcional para probar que arranca)
app.get('/', (req, res) => {
    res.send('Servidor Backend activo');
});


app.listen(config.port, () => {
    console.log(`Servidor escuchando en el puerto ${config.port}`);
});