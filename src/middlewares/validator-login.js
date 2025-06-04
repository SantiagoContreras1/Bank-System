import { body } from "express-validator";
import { existEmail } from "../helpers/db-validator.js";

export const registerValidator=[
    body("nombre","El nombre es obligatorio").not().isEmpty(),
    body("email",'Ingresa un email válido').not().isEmpty(),
    body("email").custom(existEmail),
    body("password","La contraseña debe de ser de un mínimo de 6 caracteres").isLength({min:6}),
]

export const loginValidator=[
    body("email").optional().isEmail().withMessage('Ingresa un email válido'),
    body("password","La contraseña es inválida ").isLength({min:6}),
]