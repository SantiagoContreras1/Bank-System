import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { dbConnection } from "./mongo.js";

import authRoutes from '../src/auth/auth.routes.js';
import accountRoutes from '../src/accounts/account.routes.js';
import userRoutes from '../src/users/user.routes.js';
import balanceRoutes from '../src/balance/balance.route.js';
import transactionRoutes from '../src/transactions/transaction.routes.js';
import twoFactorRoutes from '../src/2fa/2fa.routes.js';

import User from '../src/users/user.model.js';
import Account from '../src/accounts/account.model.js';
import { hash } from "argon2";

// Función para generar un número de cuenta aleatorio (10 dígitos)
const generateAccountNumber = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000);
};

const middlewares = (app) => {
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(cors());
  app.use(helmet());
  app.use(morgan('dev'));
};

const routes = (app) => {
  app.use("/bankSystem/v1/auth", authRoutes);
  app.use("/bankSystem/v1/account", accountRoutes);
  app.use("/bankSystem/v1/user", userRoutes);
  app.use("/bankSystem/v1/balance", balanceRoutes);
  app.use("/bankSystem/v1/transaction", transactionRoutes);
  app.use("/bankSystem/v1/2fa", twoFactorRoutes);
};

const conectarDb = async () => {
  try {
    await dbConnection();
    console.log('MongoDB | Conectado');
    await crearAdmin(); // Crear admin y cuenta si no existen
  } catch (error) {
    console.log('Error al conectarse a la DB:', error);
  }
};

export const initServer = () => {
  const app = express();
  const port = process.env.PORT || 3000;

  middlewares(app);
  routes(app);
  conectarDb();

  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
};

// Crear usuario administrador con cuenta si no existe
const crearAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ username: 'ADMINB' });

    if (!existingAdmin) {
      const hashedPassword = await hash('ADMINB');

      const admin = await User.create({
        name: 'Default Admin',
        username: 'ADMINB',
        dpi: 1234567890,
        address: 'Admin HQ',
        phone: 1234567890,
        email: 'adminb@adminb.com',
        password: hashedPassword,
        monthlyIncome: 999999,
        role: 'ADMIN_ROLE',
      });

      await Account.create({
        accountNo: generateAccountNumber(),
        user: admin._id,
        balance: 0,
        verify: true,
        status: true
      });

      console.log('✅ Admin creado correctamente con cuenta:', admin.username);
    } else {
      console.log('ℹ️ Admin ya existe');
    }
  } catch (error) {
    console.error(`❌ Error al crear admin: ${error.message}`);
  }
};
