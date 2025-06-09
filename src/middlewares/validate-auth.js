import { verify } from "argon2";  
import User from "../users/user.model.js"

export const validateLoginUser = async (req, res, next) => {
    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                msg: 'Incorrect credentials, the email does not exist in the database.'
            });
        }
        if(!user.status){
            return res.status(400).json({
                msg: 'The user does not exist in the database'
            });
        }
        const validPassword = await verify(user.password, password);
        if (!validPassword) {
            return res.status(400).json({
                msg: 'The password is incorrect'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Internal server error",
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