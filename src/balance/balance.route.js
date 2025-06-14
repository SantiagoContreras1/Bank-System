import express from 'express';
import { convertirBalancePorMoneda } from './balanceController.js';

const router = express.Router();

router.get('/:accountNo/:moneda', convertirBalancePorMoneda);

// Ejemplos para realizar la peticion
// GET /convertir-balance/12345678/USD
//GET /convertir-balance/12345678/JPY

export default router;