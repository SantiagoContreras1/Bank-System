import Transaction from "../transactions/transaction.model.js";
import Account from "../accounts/account.model.js";
import User from "../users/user.model.js";
import Product from "../products/product.model.js";
import { validarAdmin } from "./validar-admin.js";

export const canCreateTransaction = async (req, res, next) => {

    const sumarTransaccionesDelDia = (transacciones) => {
      const ahora = new Date();
      const inicioDia = new Date(
        ahora.getFullYear(),
        ahora.getMonth(),
        ahora.getDate()
      );
      const finDia = new Date(
        ahora.getFullYear(),
        ahora.getMonth(),
        ahora.getDate() + 1
      );

      const total = transacciones.reduce((suma, transaccion) => {
        const fecha = new Date(transaccion.createdAt);
        const dentroDelDia =
          fecha >= inicioDia && fecha < finDia && transaccion.status !== false;

        return dentroDelDia ? suma + (transaccion.amount || 0) : suma;
      }, 0);

      return total;
    };

    const { type, accountNo, amount, productId } = req.body;

    if (type !== "PURCHASE" && (!type || !accountNo || !amount)) {
        return res.status(400).json({
            message: "Missing required fields: type, fromAccount, accountNo, or amount"
        });
    }

    const toAccount = await Account.findOne({ accountNo: accountNo });
    const product = await Product.findById(productId);

    if (!product) {
            return res.status(404).json({
                message: "Product not found."
            });
        }
    
    if (type !== "PURCHASE" && !toAccount) {        
        return res.status(404).json({
            message: "Account not found."
        });
    }

    if (type !== 'DEPOSIT' && type !== 'TRANSFER' && type !== 'PURCHASE') {
        return res.status(400).json({
            message: "Invalid transaction type. Must be either 'DEPOSIT', 'TRANSFER' or 'PURCHASE'."
        });
    }

    if (type === 'DEPOSIT'){
        validarAdmin(req, res, next);
        return;
    }

    if (amount < 5 || amount > 2000) {
        return res.status(400).json({
            message: "Amount must be between Q.5.00 and Q.2000.00"
        });
    
    }

    if (type === 'TRANSFER' && toAccount._id.toString() === req.user.account._id.toString()) {
        return res.status(400).json({
            message: "You cannot transfer to the same account."
        });
    }

    
    const fromUser = await User.findById(req.user._id);

    const fromAccount = await Account.findById(fromUser.account._id);

    const transactionOfDay = sumarTransaccionesDelDia(fromAccount.transactions);

    if (transactionOfDay + amount > 10000) {
        return res.status(400).json({
            message: "You can only transfer a maximum of Q.10,000.00 per day."
        });
    }

    next();
}

export const canUpdateTransaction = async (req, res, next) => {
    const { amount } = req.body;

    if (!req.params.id) {
        return res.status(400).json({
            message: "Deposit ID is required."
        });
    }

    const transaction = await Transaction.findById(req.params.id).sort({ createdAt: -1 });

    const timeElapsed = Date.now() - new Date(transaction.createdAt).getTime();
    
    const minutesElapsed = Math.floor(timeElapsed / 60000);
    
    if (minutesElapsed > 1) {
        return res.status(400).json({
            message: "You can only update a transaction within 1 minutes of its creation."
        });
    }

    if (!transaction) {
        return res.status(404).json({
            message: "Deposit not found."
        });
    }

    if (transaction.status === false) {
        return res.status(400).json({
            message: "Deposit has been canceled."
        });
    }

    if (transaction.type === 'TRANSFER') {
        return res.status(401).json({
            message: "Only deposit transactions can be updated."
        });
    }

    if (!amount) {
        return res.status(400).json({
            message: "Amount is required."
        });
        
    }

    next();
}

export const canCancelTransaction = async (req, res, next) => {
    if (!req.params.id) {
        return res.status(400).json({
            message: "Deposit ID is required."
        });
    }

    const transaction = await Transaction.findById(req.params.id).sort({ createdAt: -1 });

    const timeElapsed = Date.now() - new Date(transaction.createdAt).getTime();
    
    const minutesElapsed = Math.floor(timeElapsed / 60000);
    
    if (minutesElapsed > 1) {
        return res.status(400).json({
            message: "You can only cancel a deposit within 1 minutes of its creation."
        });
    }

    if (!transaction) {
        return res.status(404).json({
            message: "Deposit not found."
        });
    }

    if (transaction.status === false) {
        return res.status(400).json({
            message: "Deposit has been canceled."
        });
    }

    if (transaction.type === 'TRANSFER') {
        return res.status(401).json({
            message: "Only deposit transactions can be cancelled."
        });
    }

    next();
}