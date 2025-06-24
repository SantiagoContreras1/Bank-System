import Router from "express";
import { createTransaction, getTransactions, getTransactionById, getTransactionsByAccountId, updateTransaction, cancelTransaction, getCredit, getChartData } from "./transaction.controller.js";
import { canCreateTransaction, canUpdateTransaction, canCancelTransaction } from "../middlewares/validate-transaction.js";
import { validarAdmin } from "../middlewares/validar-admin.js";
import { validarJWT } from "../middlewares/validar-JWT.js";
import { validate2FA } from "../middlewares/validate2fa.js";
const router = Router();

router.post(
    "/", 
    validarJWT, 
    canCreateTransaction, 
    validate2FA,
    createTransaction
);
router.get(
    "/", 
    validarJWT,
    getTransactions
);
router.get(
    "/credit", 
    validarJWT,
    getCredit
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
router.get('/chart/:accountId', getChartData);
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