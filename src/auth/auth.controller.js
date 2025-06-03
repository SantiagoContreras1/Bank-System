import { hash, verify } from "argon2";
import User from "../users/user.model.js";
import { generarJWT } from "../helpers/generar-JWT.js";

export const register = async (req, res) => {
  try {
    const data = req.body;
    const encryptedPassword = await hash(data.password);

    console.log("datos:", data);

    const user = await User.create({
      nombre: data.nombre,
      email: data.email,
      password: encryptedPassword,
    });

    res.status(200).json({
      msg: "Usuario registrado correctamente",
      userDetails: {
        user: user.name,
        email: user.email,
        role: user.role
      },
    });
  } catch (error) {
    return res.status(400).json({
      msg: "Error al registrar el usuario",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("email:", email);
    console.log("password:", password);
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        msg: "Usuario no encontrado",
      });
    }

    if (!user.estado) {
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
    return res.status(400).json({
      msg: "Error al iniciar sesion",
      error: error.message,
    });
  }
};