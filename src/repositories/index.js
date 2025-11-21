const UserDao = require('../daos/user.dao');
const ProductDao = require('../daos/product.dao');
const CartDao = require('../daos/cart.dao');
const TicketDao = require('../daos/ticket.dao');

const UserRepository = require('./user.repository');
const TicketRepository = require('./ticket.repository');
const CartRepository = require('./cart.repository');

// Instanciamos los Repositories inyectando el DAO correspondiente
const userService = new UserRepository(UserDao);
const ticketService = new TicketRepository(TicketDao);

const cartService = new CartRepository(CartDao)
const productService = ProductDao; 


module.exports = {
    userService,
    ticketService,
    productService,
    cartService
};