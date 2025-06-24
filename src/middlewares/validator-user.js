import { verify } from "argon2";
import User from "../users/user.model.js";
import Account from "../accounts/account.model.js";


export const checkOwnAccount = async (req, res, next) => {
  const { userId } = req.params;
  const authenticatedUser = req.user;

  if (!authenticatedUser) {
    return res.status(401).json({
        success: false,
        msg: "Authentication required or invalid token for checkOwnAccount."
    });
}

  if (authenticatedUser.role !== "ADMIN_ROLE" && authenticatedUser.id !== userId) {
    return res.status(403).json({
      success: false,
      msg: "You can only update or delete your own account",
    });
  }

  next();
};


export const checkRoleChange = (req, res, next) => {
  const { role } = req.body;
  const authenticatedUser = req.user;

  if (!authenticatedUser) {
       return res.status(401).json({
           success: false,
           msg: "Authentication required or invalid token for checkRoleChange."
       });
   }

  if (role !== undefined && authenticatedUser.role !== "ADMIN_ROLE") { 
    return res.status(403).json({
      success: false,
      msg: "You are not allowed to change your role",
    });
  }

  next();
};


export const validatePasswordOnDelete = async (req, res, next) => {
  const { userId } = req.params;
  const { password } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      msg: "User not found",
    });
  }

  const validPassword = await verify(user.password, password);

  if (!validPassword) {
    return res.status(400).json({
      success: false,
      msg: "Password is incorrect",
    });
  }

  next();
};

export const validateEmailExists = async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  
  if (user) {
    return res.status(400).json({
      success: false,
      msg: "Email already exists",
    });
  } else {
    next();
  }

};

export const validateCurrentPassword = async (req, res, next) => {
  const userId = req.user
  console.log(userId)
  const { currentPassword, password } = req.body;

  if (password && !currentPassword) {
    return res.status(400).json({
      success: false,
      msg: "Current password is required to update the password",
    });
  }

  if (password) {
    const user = await User.findById(userId);
    const validPassword = await verify(user.password, currentPassword);

    if (!validPassword) {
      return res.status(400).json({
        success: false,
        msg: "Current password is incorrect",
      });
    }
  }

  next();
};

export const validateFavorite = async (req, res, next) => {
  try {
    const { accountNo, alias } = req.body;
    const user = await User.findById(req.user._id).populate('favorites.account');
    const account = await Account.findOne({ accountNo: accountNo });

    if(!account){
      return res.status(404).json({
        success: false,
        msg: "Cuenta no encontrada",
      });
    }

    // Verificar si la cuenta ya está en favoritos
    const existingFavorite = user.favorites.find(favorite => {
      const favoriteAccountId = favorite.account ? favorite.account._id || favorite.account : null;
      const accountId = account._id;
      return favoriteAccountId && favoriteAccountId.toString() === accountId.toString();
    });

    if(existingFavorite) {
      return res.status(400).json({
        success: false,
        msg: "Esta cuenta ya está en tus favoritos",
        existingAlias: existingFavorite.alias
      });
    }

    // Verificar que no sea la cuenta propia del usuario
    if(account.user.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        msg: "No puedes agregar tu propia cuenta a favoritos"
      });
    }

    // Verificar que la cuenta esté activa
    if(!account.status) {
      return res.status(400).json({
        success: false,
        msg: "No se puede agregar una cuenta inactiva a favoritos"
      });
    }

    // Agregar la cuenta y el usuario al request para usarlos en el controlador
    req.account = account;
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error al validar favorito",
      error: error.message,
    });
  }
};