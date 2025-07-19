import { Router } from "express";

import {
  saveProduct,
  getProducts,
  searchProduct,
  updateProduct,
  deleteProduct,
  getActiveProductsCount,
} from "./product.controller.js";
import { validarJWT } from "../middlewares/validar-JWT.js";
import { validarAdmin } from "../middlewares/validar-admin.js";
import { uploadProductImages } from "../middlewares/uploadImages.js";
import { validateDisscount } from "../middlewares/disscount-validator.js";
import { parseJsonFields } from "../middlewares/parseJsonFields.js";
import { validationProductPrice } from "../middlewares/price-product-validator.js";

const router = Router();

router.get("/", getProducts);
router.get("/search/:id", [validarJWT], searchProduct);

router.post(
  "/save",
  [
    validarJWT,
    validarAdmin,
    uploadProductImages,
    validateDisscount,
    validationProductPrice,
    parseJsonFields([
      "disscountPorcent",
      "originalPrice",
      "description",
      "name",
      "type",
      "enterprise",
    ]),
  ],
  saveProduct
);

router.put(
  "/update/:id",
  [
    validarJWT,
    validarAdmin,
    validateDisscount,
    validationProductPrice,
    uploadProductImages,
    parseJsonFields([
      "disscountPorcent",
      "originalPrice",
      "description",
      "name",
      "type",
      "enterprise",
    ]),
  ],
  updateProduct
);

router.delete("/delete/:id", [validarJWT, validarAdmin], deleteProduct);

router.get("/active-count", getActiveProductsCount);

export default router;
