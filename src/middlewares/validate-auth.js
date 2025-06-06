import { verify } from "argon2";  
import User from "../users/user.model.js"

export const validateLoginUser = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;

        // Buscar usuario por email o username
        const user = await User.findOne({
            $or: [
                { email: email },
                { username: username }
            ]
        });

        if (!user) {
            return res.status(400).json({
                msg: 'Credenciales incorrectas, el email o username no existe en la base de datos.'
            });
        }
        if(!user.status){
            return res.status(400).json({
                msg: 'El usuario no existe en la base de datos'
            });
        }
        const validPassword = await verify(user.password, password);
        if (!validPassword) {
            return res.status(400).json({
                msg: 'La contraseña es incorrecta'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Error interno del servidor",
            error: error.message
        });
    }
}

export const validateRegisterUser = async (req, res, next) => {
    try {
        const { email } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "The email is already registered",
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            message: "Validation error",
            error: error.message
        });
    }
};