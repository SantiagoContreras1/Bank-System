import Transaction from "./transaction.model.js";
import User from "../users/user.model.js";
import Account from "../accounts/account.model.js";


export const createTransaction = async (req, res) => {
    try {
        const data = req.body;

        const toAccount = await Account.findOne({ accountNo: data.accountNo });

        if (data.type === 'TRANSFER'){

            const fromUser = await User.findById(req.user._id);

            const fromAccount = await Account.findById(fromUser.account._id);

            const transaction = new Transaction({
            type: data.type,
            fromAccount: fromAccount._id, 
            toAccount: toAccount._id,
            amount: Number(data.amount),
            description: data.description,
            });

            fromAccount.balance -= Number(data.amount);

            toAccount.balance += Number(data.amount);

            fromAccount.transactions.push(transaction._id);

            await transaction.save();
            await fromAccount.save();
            await toAccount.save();

            res.status(201).json({
            transaction, 
            message: "Tranference created successfully"
            });
        }

        if (data.type === 'DEPOSIT') {
            const admin = await User.findById(req.user._id);
            console.log(toAccount);
            const transaction = new Transaction({
                type: data.type,
                admin: admin._id,
                toAccount: toAccount._id,
                amount: Number(data.amount),
                description: data.description,
            });

            toAccount.balance += Number(data.amount);

            await transaction.save();
            await toAccount.save();
            await admin.save();

            res.status(201).json({
            transaction, 
            message: "deposit created successfully"
            });
        }
        

        
    } catch (error) {
        res.status(500).json({ 
            message: "Error creating transaction",
            error: error.message 
        });
    }  
}

export const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ status: true })
            .sort({ createdAt: -1})
            
        res.status(200).json({
            transactions, 
            message: "Transactions fetched successfully"
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error fetching transactions",
            error: error.message 
        });
    }
}

export const getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        
        res.status(200).json({
            transaction, 
            message: "Transaction fetched successfully"
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error fetching transaction",
            error: error.message 
        });
    }
}

export const getTransactionsByAccountId = async (req, res) => {
    try {
        const transactions = await Transaction.find({
            $or: [
                { fromAccount: req.params.id },
                { toAccount: req.params.id }
            ],
            status: true
        }).sort({ createdAt: -1 });

        res.status(200).json({
            transactions, 
            message: "Transactions by account fetched successfully"
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error fetching transactions by account",
            error: error.message 
        });
    }
}

export const updateTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        const data = req.body;
        
        transaction.amount = Number(data.amount) || transaction.amount;

        await transaction.save();

        res.status(200).json({
            transaction, 
            message: "Transaction updated successfully"
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error updating transaction",
            error: error.message 
        });
    }
}

export const cancelTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        transaction.status = false;
        await transaction.save();

        res.status(200).json({
            transaction, 
            message: "Transaction cancelled successfully"
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error cancelling transaction",
            error: error.message 
        });
    }
}