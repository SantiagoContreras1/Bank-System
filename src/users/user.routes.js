import { Router } from "express";
import { updateUser, updatePassword } from "./user.controller.js";
import { checkRoleChange, validateCurrentPassword } from "../middlewares/validator-user.js";
import { validarJWT } from "../middlewares/validar-JWT.js";

const router = Router();

router.put(
    "/:id",
    [
        validarJWT,
        checkRoleChange, 
    ],
    updateUser
)

router.patch("/password",
    validarJWT,
    validateCurrentPassword,
    updatePassword
  )

export default router;