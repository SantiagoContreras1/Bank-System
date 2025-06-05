import { Router } from 'express';
import { getAccounts, getAccountById,  getUnverifiedAccounts, updateAccountVerify } from '../accounts/account.controller.js'; // Ajusta las rutas a tu estructura
import { validarJWT } from '../middlewares/validar-JWT.js';
import { validarAdmin } from '../middlewares/validar-admin.js'
const router = Router();

router.get('/', getAccounts);

router.get('/unverified/', validarAdmin, validarJWT, getUnverifiedAccounts);

router.get('/:id', getAccountById);

router.patch('/:id', validarAdmin, validarJWT, updateAccountVerify);

export default router;
