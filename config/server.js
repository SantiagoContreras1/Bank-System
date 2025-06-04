import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { dbConnection } from "./mongo.js";
import authRoutes from '../src/auth/auth.routes.js';
import accountRoutes from '../src/accounts/account.routes.js';
import userRoutes from '../src/users/user.routes.js';
import User from '../src/users/user.model.js'; // ← IMPORTACIÓN NECESARIA
import { hash } from "argon2";

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
};

const conectarDb = async () => {
  try {
    await dbConnection();
    console.log('MongoDB | Conectado');
    await crearAdmin(); // ← Solo se ejecuta después de conectar la DB
  } catch (error) {
    console.log('Error al conectarse a la DB:', error);
  }
};

export const initServer = () => {
  const app = express();
  const port = process.env.PORT || 3002;

  middlewares(app);
  routes(app); // ← No olvides registrar las rutas
  conectarDb();

  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
};

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

      console.log('✅ Admin creado correctamente:', admin.username);
    } else {
      console.log('ℹ️ Admin ya existe');
    }
  } catch (error) {
    console.error(`❌ Error al crear admin: ${error.message}`);
  }
};
