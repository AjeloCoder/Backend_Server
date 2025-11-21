const { productService } = require('../repositories/index');

class ProductController {

    async getProducts(req, res) {
        try {
            // Aquí podrías agregar paginación después
            const products = await productService.getAll();
            res.send({ status: 'success', payload: products });
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    }

    async createProduct(req, res) {
        try {
            const { title, description, price, thumbnail, code, stock, category } = req.body;

            if (!title || !price || !code || !stock) {
                return res.status(400).send({ error: 'Faltan datos obligatorios' });
            }

            const newProduct = {
                title, description, price, thumbnail, code, stock, category,
                status: true
            };

            const result = await productService.save(newProduct);
            res.status(201).send({ status: 'success', payload: result });

        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    }
    
  async updateProduct(req, res) {
        try {
            const { pid } = req.params;
            const updateData = req.body; // Lo que quieras cambiar (ej: stock)

            // Llama al servicio (que usa el DAO)
            const updatedProduct = await productService.update(pid, updateData);

            if (!updatedProduct) {
                return res.status(404).send({ error: 'Producto no encontrado' });
            }

            res.send({ status: 'success', payload: updatedProduct });
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    }
}

module.exports = new ProductController();