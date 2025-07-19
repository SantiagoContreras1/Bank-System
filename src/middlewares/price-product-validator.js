import Product from '../products/product.model.js'
import { body } from 'express-validator';

export const validationProductPrice = async (req,res,next) => {
    let { profitPrice } = req.body

    // Ver que profitPrice sea un number y este definido
    if (profitPrice === undefined || isNaN(profitPrice)) {
        return res.status(400).json({
            ss: false,
            msg: "Profit price must be a number and is required",
        })
    }
    
    // convertir el profitPrice a number
    profitPrice = parseFloat(profitPrice)

    if (profitPrice >= 2000) {
        return res.status(400).json({
            success: false,
            msg: "No pueden crearse productos con precio mayor o igual a 2000",
        });
    }

    next()
}