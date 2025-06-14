import Router from "express";
import { start2FA, verify2FA } from "./2fa.controller.js";
import { validarJWT } from "../middlewares/validar-JWT.js";

const router = Router();

router.post("/start", validarJWT, start2FA);

router.post("/verify", validarJWT, verify2FA);

export default router;
