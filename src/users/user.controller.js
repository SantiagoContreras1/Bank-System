import User from "./user.model.js";
import { hash, verify } from "argon2";
import { response, request } from "express";

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

export const updatePassword = async (req, res = response) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    const isMatch = await verify(user.password, currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        msg: "Current password is incorrect"
      });
    }

    const hashedPassword = await hash(newPassword);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      msg: "Password updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error updating password",
      error: error.message
    });
  }
};
