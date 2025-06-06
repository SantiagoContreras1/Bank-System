import User from "../users/user.model.js";
import Account from "../accounts/account.model.js";
import { hash, verify } from "argon2";
import { generarJWT } from "../helpers/generar-JWT.js";
import { faker } from "@faker-js/faker";
export const login = async (req, res) => {
  const { email, username, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [
        { email: email },
        { username: username }
      ]
    });

    if (!user) {
      return res.status(404).json({
        msg: "Usuario no encontrado",
      });
    }

    if (!user.status) {
      return res.status(400).json({
        msg: "Usuario inactivo",
      });
    }

    const validPass = await verify(user.password, password);

    if (!validPass) {
      return res.status(400).json({
        msg: "Contraseña incorrecta",
      });
    }

    const token = await generarJWT(user.id);
    
    return res.status(200).json({
      msg: "Usuario logueado correctamente",
      user:{
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      
      msg: "Error al iniciar sesion",
      error: error.message,
    });
  }
};

export const register = async (req, res) => {
  try {
    const data = req.body;

    const encryptedPassword = await hash(data.password);

    const user = await User.create({
      name: data.name,
      username: data.username,
      dpi: data.dpi,
      address: data.address,
      phone: data.phone,
      email: data.email,
      password: encryptedPassword,
      monthlyIncome: data.monthlyIncome,
      role: data.role || 'USER_ROLE',
    });

    const account = await Account.create({
      accountNo: faker.finance.accountNumber(10),
      user: user._id,
      balance: 0,
      verify: false,
    });

    user.account = account._id;
    await user.save();

    return res.status(200).json({
      message: "User registered successfully",
      userDetails: {
        user,
        account,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    return res.status(500).json({
      message: "User registration failed",
      error: error.message,
    });
  }
};
