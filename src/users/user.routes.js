import { Router } from "express";
import { updateUser, updatePassword, getUsers, getUserById, deleteUser, forgotPassword } from "./user.controller.js";
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

router.delete("/:id", [validarJWT, validarAdmin, checkOwnAccount], deleteUser);

router.patch("/password", validarJWT, validateCurrentPassword, updatePassword);

router.post("/forgot-password", forgotPassword);
export default router;
