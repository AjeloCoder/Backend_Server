const { userService, cartService } = require('../repositories/index');
const { createHash, isValidPassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');
const jwt = require('jsonwebtoken'); // <--- Asegúrate de importar esto arriba
const config = require('../config/config'); // <--- Y esto para el SECRET
const transport = require('../config/nodemailer');

class AuthController {

    async register(req, res) {
        try {
            const { first_name, last_name, email, age, password, role } = req.body;

            // 1. Verificar si falta algún dato
            if (!first_name || !last_name || !email || !age || !password) {
                return res.status(400).send({ status: 'error', error: 'Faltan datos' });
            }

            // 2. Verificar si el usuario ya existe
            const exists = await userService.getByEmail(email);
            if (exists) {
                return res.status(400).send({ status: 'error', error: 'El usuario ya existe' });
            }

            // 3. Crear un carrito vacío para el nuevo usuario
            const newCart = await cartService.save({ products: [] });

            // 4. Crear el objeto usuario con la contraseña hasheada y el ID del carrito
            const newUser = {
                first_name,
                last_name,
                email,
                age,
                password: createHash(password), // Hasheamos aquí
                cart: newCart._id,
                role: role || 'user' // Si no envían rol, por defecto es user
            };

            // 5. Guardar en BD
            await userService.create(newUser);

            res.status(201).send({ status: 'success', message: 'Usuario registrado' });

        } catch (error) {
            console.log(error);
            res.status(500).send({ status: 'error', error: 'Error interno del servidor' });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            // 1. Buscar al usuario
            const user = await userService.getByEmail(email);
            if (!user) {
                return res.status(400).send({ status: 'error', error: 'Credenciales incorrectas' });
            }

            // 2. Validar contraseña (comparar hash)
            if (!isValidPassword(user, password)) {
                return res.status(400).send({ status: 'error', error: 'Credenciales incorrectas' });
            }

            // 3. Generar Token JWT
            const token = generateToken(user);

            // 4. Enviar el token en una Cookie (HttpOnly para seguridad)
            // 'coderCookieToken' debe coincidir con el nombre en passport.config.js
            res.cookie('coderCookieToken', token, {
                maxAge: 60 * 60 * 1000 * 24, // 1 día
                httpOnly: true // La cookie no es accesible vía JS del cliente (seguridad)
            }).send({ status: 'success', message: 'Logueado correctamente' });

        } catch (error) {
            console.log(error);
            res.status(500).send({ status: 'error', error: 'Error interno del servidor' });
        }
    }

    async current(req, res) {
        try {
            // req.user viene del middleware de Passport (el payload del token)
            if (!req.user) return res.status(401).send({ error: 'No autenticado' });

            // Usamos el Repository para obtener el usuario limpio (DTO)
            // req.user.id viene del token
            const userDTO = await userService.getUserCurrent(req.user.id);
            
            res.send({ status: 'success', payload: userDTO });
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: 'Error al obtener usuario' });
        }
    }
    
    async logout(req, res) {
        // Limpiamos la cookie
        res.clearCookie('coderCookieToken').send({ status: 'success', message: 'Sesión cerrada' });
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            const user = await userService.getByEmail(email);
            
            if (!user) {
                // Por seguridad, no decimos "el usuario no existe", decimos "si existe, enviamos correo"
                // Pero para tu testing, retornaremos 404 si quieres ver el error.
                return res.status(404).send({ status: 'error', error: 'Usuario no encontrado' });
            }

            // Generamos un token con duración de 1 HORA
            const token = jwt.sign({ email }, config.jwt_secret, { expiresIn: '1h' });

            // Enviar correo
            await transport.sendMail({
                from: 'Ecommerce <tu_correo@gmail.com>',
                to: email,
                subject: 'Restablecer Contraseña',
                html: `
                    <div>
                        <h1>Restablece tu contraseña</h1>
                        <p>Haz clic en el siguiente botón para cambiar tu contraseña:</p>
                        <a href="http://localhost:8080/reset-password?token=${token}">Restablecer ahora</a>
                        <p>Este enlace expirará en 1 hora.</p>
                        <p>Si no solicitaste esto, ignora este correo.</p>
                    </div>
                `
            });

            res.send({ status: 'success', message: 'Correo enviado' });

        } catch (error) {
            console.log(error);
            res.status(500).send({ error: error.message });
        }
    }

    // 2. RESTABLECER CONTRASEÑA
    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;

            // Validar el token
            const decoded = jwt.verify(token, config.jwt_secret);
            const email = decoded.email;

            // Buscar usuario
            const user = await userService.getByEmail(email);
            if (!user) return res.status(404).send({ error: 'Usuario no encontrado' });

            // VALIDACIÓN CLAVE: No puede ser la misma contraseña anterior
            if (isValidPassword(user, newPassword)) {
                return res.status(400).send({ status: 'error', error: 'No puedes usar la misma contraseña anterior' });
            }

            // Actualizar contraseña (recordar hashear de nuevo)
            const newHash = createHash(newPassword);
            
            // Usamos el update del repositorio
            await userService.update(user._id, { password: newHash });

            res.send({ status: 'success', message: 'Contraseña actualizada correctamente' });

        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(400).send({ error: 'El token ha expirado, solicita uno nuevo' });
            }
            res.status(500).send({ error: error.message });
        }
    }


}

module.exports = new AuthController();