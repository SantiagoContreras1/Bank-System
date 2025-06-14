import { Router } from "express";
import { updateUser, updatePassword, getUsers, getUserById,getMyFavorites,deleteUser } from "./user.controller.js";
import {
  checkRoleChange,
  validateCurrentPassword,
  checkOwnAccount,
} from "../middlewares/validator-user.js";
import { validarJWT } from "../middlewares/validar-JWT.js";
import { validarAdmin } from "../middlewares/validar-admin.js";

const router = Router();

router.get("/", validarJWT, validarAdmin, getUsers);
router.get("/:userId", validarJWT, validarAdmin, getUserById);
router.put("/:id", [validarJWT, checkRoleChange], updateUser);
router.get("/me/favorites", validarJWT, getMyFavorites);

router.delete("/:id", [validarJWT, validarAdmin, checkOwnAccount], deleteUser);

router.patch("/password", validarJWT, validateCurrentPassword, updatePassword);
export default router;
