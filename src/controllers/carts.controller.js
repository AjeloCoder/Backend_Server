const { cartService, productService, ticketService } = require('../repositories/index');
const transport = require('../config/nodemailer');
const crypto = require('crypto');

class CartsController {

    async addProductToCart(req, res) {
        try {
            const { cid, pid } = req.params;
            // Verificar que el carrito existe
            const cart = await cartService.getById(cid);
            if (!cart) return res.status(404).send({ error: 'Carrito no encontrado' });

            // Buscar si el producto ya está en el array
            const productIndex = cart.products.findIndex(p => p.product._id.toString() === pid);

            if (productIndex !== -1) {
                // Si existe, sumamos cantidad
                cart.products[productIndex].quantity++;
            } else {
                // Si no existe, lo agregamos (push)
                cart.products.push({ product: pid, quantity: 1 });
            }

            const result = await cartService.save(cart); // O update, según tu DAO
            res.send({ status: 'success', payload: result });
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: error.message });
        }
    }

    async purchaseCart(req, res) {
        try {
            const { cid } = req.params;
            const cart = await cartService.getById(cid);
            if (!cart) return res.status(404).send({ error: 'Carrito no encontrado' });

            const productsNotPurchased = []; // Aquí guardaremos los que no tienen stock
            let totalAmount = 0;

            // Iteramos sobre los productos del carrito
            // Usamos un for...of para poder usar await dentro tranquilamente
            for (const item of cart.products) {
                const product = item.product; // El populate del modelo ya nos da toda la info
                const quantity = item.quantity;

                // Verificar stock
                if (product.stock >= quantity) {
                    // 1. Restar stock
                    product.stock -= quantity;
                    await productService.update(product._id, { stock: product.stock });

                    // 2. Sumar al total
                    totalAmount += product.price * quantity;
                } else {
                    // Si no hay stock, lo agregamos a la lista de rechazados
                    productsNotPurchased.push(item); // Guardamos el objeto completo (con product ID)
                }
            }

            // Actualizar el carrito: Se queda SOLO con los productos que NO se pudieron comprar
            // Ojo aquí: item.product es el objeto entero, pero en el modelo guardamos el ID. 
            // Mongoose suele ser inteligente, pero aseguremos guardando los IDs
            cart.products = productsNotPurchased; 
            await cartService.save(cart); // Guardamos el carrito "filtrado"

            // Si se compró algo (total > 0), generamos Ticket
            if (totalAmount > 0) {
                const ticketData = {
                    code: crypto.randomUUID(), // Genera un código único ej: '1b9d6bcd-bbfd-4b2d-9b5d...'
                    amount: totalAmount,
                    purchaser: req.user.email // El email viene del token (Passport)
                };

                const ticket = await ticketService.createTicket(ticketData);

                // ENVIAR CORREO
                await transport.sendMail({
                    from: 'Ecommerce <tu_correo@gmail.com>',
                    to: req.user.email,
                    subject: 'Confirmación de Compra',
                    html: `
                        <div>
                            <h1>¡Gracias por tu compra!</h1>
                            <p>Tu código de ticket es: <b>${ticket.code}</b></p>
                            <p>Total pagado: $${totalAmount}</p>
                            <hr>
                            <p>Si algún producto quedó en el carrito, es porque no teníamos stock suficiente.</p>
                        </div>
                    `
                });

                return res.send({ status: 'success', message: 'Compra realizada', ticket, productsNotPurchased });
            } else {
                return res.status(400).send({ status: 'error', message: 'No se pudo comprar nada por falta de stock', productsNotPurchased });
            }

        } catch (error) {
            console.log(error);
            res.status(500).send({ error: error.message });
        }
    }
}

module.exports = new CartsController();