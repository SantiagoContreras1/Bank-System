import { Router } from "express";
import { updateUser, updatePassword, getUsers, getUserById, deleteUser, newFavorite, dpiAlreadyExists, emailAlreadyExists, getCurrentUser } from "./user.controller.js";
import {
  checkRoleChange,
  validateCurrentPassword,
  checkOwnAccount,
  validateFavorite
} from "../middlewares/validator-user.js";
import { validarJWT } from "../middlewares/validar-JWT.js";
import { validarAdmin } from "../middlewares/validar-admin.js";

const router = Router();

router.get("/", validarJWT, validarAdmin, getUsers);
router.post("/favorite", validarJWT, validateFavorite, newFavorite);
router.get("/exists/dpi", dpiAlreadyExists);
router.get("/exists/email", emailAlreadyExists);
router.get("/me", validarJWT, getCurrentUser);

router.get("/:userId", validarJWT, validarAdmin, getUserById);

router.put("/:id", [validarJWT, checkRoleChange], updateUser);

router.patch("/password", [validarJWT, validateCurrentPassword], updatePassword);

router.delete("/:id", [validarJWT, checkOwnAccount], deleteUser);



export default router;
