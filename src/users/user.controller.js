import User from "./user.model.js";
import { hash, verify } from "argon2";
import Account from "../accounts/account.model.js";
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

    if (data.monthlyIncome) {
      const newCreditLimit = data.monthlyIncome * 3;
      const account = await Account.findOne({ user: user._id });
      
      if (account) {
        const currentRatio = account.availableCredit / account.creditLimit;
        account.creditLimit = newCreditLimit;
        account.availableCredit = newCreditLimit * currentRatio;
        await account.save();
      }
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
    const userId = req.user._id;
    const { password } = req.body;


    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "Usuario no encontrado",
      });
    }

    const hashedPassword = await hash(password);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      msg: "Contraseña actualizada exitosamente",
      user: {
        _id: user._id,
        email: user.email
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error al actualizar la contraseña",
      error: error.message,
    });
  }
};

export const newFavorite = async (req, res) => {
  try {
    const { alias } = req.body;
    const { user, account } = req;

    user.favorites.push({ account: account._id, alias });
    await user.save();
    
    res.status(200).json({
      success: true,
      msg: "Favorito agregado exitosamente",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error al agregar favorito",
      error: error.message,
    });
  }
}

export const dpiAlreadyExists = async (req, res) => {
  try {
    const dpi = req.query.dpi;
    const user = await User.findOne({ dpi });
    
    if (user) {
        return res.status(200).json({
          exists: true,
          msg: "Ya existe una cuenta con este número de DPI",
      })
    }

    res.status(200).json({
      success: true,
      exists: false,
      msg: "El usuario no existe",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error al verificar si el usuario ya existe",
      error: error.message,
    });
  }
}

export const emailAlreadyExists = async (req, res) => {
  try {
    const email = req.query.email;
    const user = await User.findOne({ email });

    if (user) {
      return res.status(200).json({
        exists: true,
        msg: "Ya existe una cuenta con este correo electrónico",
      });
    }

    res.status(200).json({
      success: true,
      exists: false,
      msg: "El usuario no existe",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error al verificar si el usuario ya existe",
      error: error.message,
    });
  }
}
