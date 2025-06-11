import Router from "express";
import { createTransaction, getTransactions, getTransactionById, getTransactionsByAccountId, updateTransaction, cancelTransaction } from "./transaction.controller.js";
import { canCreateTransaction, canUpdateTransaction, canCancelTransaction } from "../middlewares/validate-transaction.js";
import { validarAdmin } from "../middlewares/validar-admin.js";
import { validarJWT } from "../middlewares/validar-jwt.js";

const router = Router();

router.post(
    "/", 
    validarJWT, 
    canCreateTransaction, 
    createTransaction
);
router.get(
    "/", 
    validarJWT,
    getTransactions
);
router.get(
    "/:id", 
    validarJWT, 
    getTransactionById
);
router.get(
    "/account/:id", 
    validarJWT, 
    getTransactionsByAccountId
);
router.put(
    "/:id", 
    validarJWT,
    validarAdmin, 
    canUpdateTransaction, 
    updateTransaction
);
router.delete(
    "/:id", 
    validarJWT,
    validarAdmin, 
    canCancelTransaction, 
    cancelTransaction
);

export default router;