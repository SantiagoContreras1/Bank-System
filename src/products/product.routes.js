import { Router } from "express";

import {
  saveProduct,
  getProducts,
  searchProduct,
  updateProduct,
  deleteProduct
} from "./product.controller.js";
import { validarJWT } from "../middlewares/validar-JWT.js";
import { validarAdmin } from "../middlewares/validar-admin.js";
import {validateDisscount} from "../middlewares/disscount-validator.js"

const router = Router();

router.get("/", getProducts);
router.get("/search/:id", [validarJWT], searchProduct);

router.post("/save", [validarJWT, validarAdmin, validateDisscount], saveProduct);

router.put("/update/:id", [validarJWT, validarAdmin], updateProduct);

router.delete(
    "/delete/:id",
    [
        validarJWT,
        validarAdmin
    ],
    deleteProduct
)

export default router;
