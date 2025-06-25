import { Router } from "express";

import {
  saveProduct,
  getProducts,
  searchProduct,
  updateProduct,
  deleteProduct,
} from "./product.controller.js";
import { validarJWT } from "../middlewares/validar-JWT.js";
import { validarAdmin } from "../middlewares/validar-admin.js";
import { uploadProductImages } from "../middlewares/uploadImages.js";
import { validateDisscount } from "../middlewares/disscount-validator.js";
import { parseJsonFields } from "../middlewares/parseJsonFields.js";

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

export default router;
