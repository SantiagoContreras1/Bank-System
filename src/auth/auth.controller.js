import User from "../users/user.model.js";
import { hash } from "argon2";
import { generarJWT } from "../helpers/generate-jwt.js";

export const login = async (req, res) => {
  try {
    const user = req.user;
    const token = await generarJWT(user.id, user.role);
    return res.status(200).json({
      msg: "Successful login",
      userDetails: {
        token: token,
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
      surname: data.surname,
      email: data.email,
      password: encryptedPassword,
      role: "CLIENT_ROLE", 
    });

    return res.status(200).json({
      message: "User registered successfully",
      userDetails: {
        user,
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
