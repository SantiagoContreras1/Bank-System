import speakeasy from "speakeasy";
import User from "../users/user.model.js";

export const validate2FA = async (req, res, next) => {
  try {
    const { twoFactorCode, type } = req.body;
    const user = await User.findById(req.user.id);
    if(type === 'DEPOSIT') {
      return next();
    }
    if (!user.twoFactorEnabled) {
      return res.status(401).json({
        success: false,
        msg: "2FA is not enabled",
      });
    }
    if(!twoFactorCode) {
      return res.status(401).json({
        success: false,
        msg: "2FA code is required",
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: twoFactorCode,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: "Invalid 2FA code",
      });
    }

    next();
  } catch (error) {
    console.error("Error en validate2FA:", error);
    res.status(500).json({
      success: false,
      msg: "Error validating 2FA",
      error: error.message,
    });
  }
}