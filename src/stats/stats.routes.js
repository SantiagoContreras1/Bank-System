import { Router } from 'express';
import { 
  getDailySummary, 
  getChartData, 
  getTopAccounts, 
  getRecentTransactions, 
  getSystemStats, 
  getMonthlyTransactionCounts
} from './stats.controller.js';
import { validarJWT } from '../middlewares/validar-JWT.js';
import { validarAdmin } from '../middlewares/validar-admin.js';

const router = Router();

// Middleware para validar que sea admin
const adminMiddleware = [validarJWT, validarAdmin];

// Rutas protegidas solo para administradores
router.get('/daily-summary', adminMiddleware, getDailySummary);
router.get('/chart-data', adminMiddleware, getChartData);
router.get('/top-accounts', adminMiddleware, getTopAccounts);
router.get('/recent-transactions', adminMiddleware, getRecentTransactions);
router.get('/system-stats', adminMiddleware, getSystemStats);
router.get('/monthly-transaction-counts', adminMiddleware, getMonthlyTransactionCounts);

export default router;
