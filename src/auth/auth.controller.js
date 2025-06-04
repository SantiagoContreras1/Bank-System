import User from "../users/user.model.js";
import Account from "../accounts/account.model.js";
import { hash } from "argon2";
import { generarJWT } from "../helpers/generar-JWT.js";

export const login = async (req, res) => {
  try {
    const user = req.user;
    const token = await generarJWT(user.id, user.role);

    return res.status(200).json({
      msg: "Successful login",
      userDetails: {
        token,
        uId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Server error",
      error: e.message,
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
      monthlyIncome: data.monthlyIncome, // ← CAMBIO APLICADO
      role: data.role || 'USER_ROLE',
    });

    const account = await Account.create({
      accountNo: Math.floor(Math.random() * 1000000000),
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
