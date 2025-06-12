import User from "./user.model.js";
import { hash, verify } from "argon2";
import { response, request } from "express";

export const getUsers = async (req = request, res = response) => {
  try {
    const query = { status: true };

    const [total, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query)
    ]);

    res.status(200).json({
      success: true,
      total,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "error when searching for users",
      error: error.message,
    });
  }
};

export const getUserById = async (req = request, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "error when searching for user",
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { password, ...data } = req.body;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    if (password) {
      user.password = await hash(password);
    }

    Object.keys(data).forEach((key) => {
      user[key] = data[key];
    });

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      msg: "User updated successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      message: "An error occurred while updating the user.",
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Attempting to deactivate user with ID:", id);

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { estado: false },
      { new: true }
    );

    if (!updatedUser) {
      console.log("User not found for ID:", id);
      return res.status(404).json({
        success: false,
        msg: "User not found or already deactivated",
      });
    }

    res.status(200).json({
      success: true,
      msg: "User deactivated successfully",
      user: {
        _id: updatedUser._id,
        estado: updatedUser.estado,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "An error occurred while deactivating the user.",
      error: error.message,
    });
  }
};

export const updatePassword = async (req, res = response) => {
  try {
    const userId = req.user;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ msg: "La nueva contraseña es requerida." });
    }

    const hashedPassword = await hash(newPassword);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );

    res.status(200).json({
      success: true,
      msg: "Contraseña actualizada exitosamente",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error al actualizar la contraseña",
      error: error.message,
    });
  }
};

export const forgotPassword = async (req, res = response) => {
  try {
    const { email, username, phone, newPassword } = req.body;

    const user = await User.findOne({ email, username, phone });

    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "Credenciales incorrectas o usuario no encontrado. Verifica tu email, nombre de usuario y teléfono.",
      });
    }

    const hashedPassword = await hash(newPassword);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      msg: "Contraseña actualizada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.",
    });
  } catch (error) {
    console.error("Error en forgotPassword:", error);
    res.status(500).json({
      success: false,
      msg: "Hubo un error al intentar restablecer tu contraseña. Por favor, inténtalo de nuevo más tarde.",
      error: error.message,
    });
  }
};