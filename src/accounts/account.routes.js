import { Router } from 'express';
import { getAccounts, getAccountById,  getUnverifiedAccounts, updateAccountVerify, getAccountByUser, searchAccount, getAccountByUserId } from '../accounts/account.controller.js'; // Ajusta las rutas a tu estructura
import { validarJWT } from '../middlewares/validar-JWT.js';
import { validarAdmin } from '../middlewares/validar-admin.js'
const router = Router();

router.get('/', validarJWT, validarAdmin, getAccounts);

router.get('/my-account', validarJWT, getAccountByUser)

router.get('/unverified/', validarAdmin, validarJWT, getUnverifiedAccounts);

router.get("/search/:accountNo", validarJWT, searchAccount)

router.get('/user/:userId', getAccountByUserId);

router.get('/:id', getAccountById);


router.patch('/:id', validarAdmin, validarJWT, updateAccountVerify);


export default router;
