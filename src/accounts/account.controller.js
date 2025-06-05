import Account from '../accounts/account.model.js';
import User from '../users/user.model.js';

export const getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ status: true })
      .populate('user', 'username name dpi email phone address')
      .select('accountNo balance verify status createdAt');

    res.status(200).json({
      success: true,
      msg: "Accounts fetched successfully",
      accounts,
    });
  } catch (error) {
    console.error('Error en getAccounts:', error);
    res.status(500).json({
      success: false,
      msg: "Error fetching accounts",
      error: error.message,
    });
  }
};

export const getAccountById = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await Account.findById(id)
      .populate('user', 'username name dpi email phone address')
      .select('accountNo balance verify status createdAt');

    if (!account) {
      return res.status(404).json({
        success: false,
        msg: "Account not found",
      });
    }

    res.status(200).json({
      success: true,
      msg: "Account found",
      account,
    });
  } catch (error) {
    console.error('Error en getAccountById:', error);
    res.status(500).json({
      success: false,
      msg: "Error fetching account",
      error: error.message,
    });
  }
};

export const getUnverifiedAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ verify: false, status: true })
      .populate('user', 'username name dpi email phone address')
      .select('accountNo balance verify status createdAt');

    res.status(200).json({
      success: true,
      msg: "Unverified accounts fetched successfully",
      accounts,
    });
  } catch (error) {
    console.error('Error in getUnverifiedAccounts:', error);
    res.status(500).json({
      success: false,
      msg: "Error fetching unverified accounts",
      error: error.message,
    });
  }
};

export const updateAccountVerify = async (req, res) => {
  try {
    const { id } = req.params;
    const { verify } = req.body;

    const account = await Account.findById(id);

    if (!account) {
      return res.status(404).json({
        success: false,
        msg: "Account not found",
      });
    }

    account.verify = verify;
    await account.save();

    res.status(200).json({
      success: true,
      msg: "Account verification status updated",
      account,
    });
  } catch (error) {
    console.error('Error in updateAccountVerify:', error);
    res.status(500).json({
      success: false,
      msg: "Error updating verification status",
      error: error.message,
    });
  }
};
