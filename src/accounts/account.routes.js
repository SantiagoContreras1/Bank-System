import { Router } from 'express';
import {
  getAccounts,
  getAccountById,
  getUnverifiedAccounts,
  updateAccountVerify,
  getAccountByUser,
  searchAccount
} from '../accounts/account.controller.js';

import { validarJWT } from '../middlewares/validar-JWT.js';
import { validarAdmin } from '../middlewares/validar-admin.js';

const router = Router();

router.get('/', validarJWT, validarAdmin, getAccounts); 
router.get('/unverified', validarJWT, validarAdmin, getUnverifiedAccounts);
router.patch('/:id', validarJWT, validarAdmin, updateAccountVerify); 

router.get('/my-account', validarJWT, getAccountByUser); 
router.get('/search/:accountNo', validarJWT, searchAccount); 

router.get('/:id', validarJWT, getAccountById); 

export default router;
