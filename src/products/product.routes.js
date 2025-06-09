import { Router } from "express";
//import { validar-JWT } from "../middlewares/validar-JWT.js";

import {
  saveProduct,
  getProducts,
  searchProduct,
  updateProduct,
  deleteProduct
} from "./product.controller.js";
import { validarJWT } from "../middlewares/validar-JWT.js";
import { validarAdmin } from "../middlewares/validar-admin.js";

const router = Router();

router.get("/", getProducts);
router.get("/search/:id", [validarJWT], searchProduct);

router.post("/save", [validarJWT, validarAdmin], saveProduct);

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
