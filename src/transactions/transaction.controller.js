import Transaction from "./transaction.model.js";
import User from "../users/user.model.js";
import Account from "../accounts/account.model.js";
import Product from "../products/product.model.js";


export const createTransaction = async (req, res) => {
    try {
        const data = req.body;

        const toAccount = await Account.findOne({ accountNo: data.accountNo });

        if (data.type === 'PURCHASE') {

            const product = await Product.findById(data.productId);
            const fromAccount = await Account.findById(req.user.account._id);

            if (!product) {
                return res.status(404).json({
                    message: "Product not found."
                });
            }

            if (!fromAccount) {
                return res.status(404).json({
                    message: "Account not found."
                });
            }

            const transaction = new Transaction({
                type: data.type,
                fromAccount: fromAccount._id,
                toAccount: product._id,
                toAccountModel: 'Product',
                amount: Number(product.profitPrice),
                description: "Purchase of " + product.name + " " + product.type
            });

            if( fromAccount.balance < Number(product.profitPrice)) {
                if(fromAccount.availableCredit >= Number(product.profitPrice)) {
                    fromAccount.availableCredit -= Number(product.profitPrice);
                    fromAccount.transactions.push(transaction._id);
                    await fromAccount.save();
                    await transaction.save();
                }
                return res.status(201).json({
                  transaction,
                  message: "Purchase created successfully, using credit"
                });
            }

            fromAccount.balance -= Number(product.profitPrice);
            fromAccount.transactions.push(transaction._id);
            await fromAccount.save();
            await transaction.save();

            return res.status(201).json({
                transaction,
                message: "Purchase created successfully"
            });         

        }

        if (data.type === 'TRANSFER'){

            const fromUser = await User.findById(req.user._id);

            const fromAccount = await Account.findById(fromUser.account._id);

            const transaction = new Transaction({
            type: data.type,
            fromAccount: fromAccount._id, 
            toAccount: toAccount._id,
            toAccountModel: 'Account',
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
                toAccountModel: 'Account',
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

export const getCredit = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        const account = await Account.findById(user.account._id);
        const credit = account.creditLimit;
        const creditLeft = account.availableCredit;
        const creditUsed = (credit - creditLeft)*1.10;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const dateOfPayment = new Date(currentYear, currentMonth, 5)
        res.status(200).json({
            creditLimit: credit,
            availableCredit: creditLeft,
            payment: creditUsed,
            dateOfPayment: dateOfPayment, 
            message: "Credit fetched successfully"
        });

    } catch (error) {
        res.status(500).json({ 
            message: "Error fetching credit",
            error: error.message 
        });
    }
}

export const getChartData = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { months = 6 } = req.query;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const transactions = await Transaction.find({
      $or: [
        { fromAcount: accountId },
        { toAccount: accountId }
      ],
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    const labels = [];
    const incomeData = [];
    const expenseData = [];

    const monthlyData = new Map();
    const currentMonth = new Date().toLocaleString('default', { month: 'short' });
    let currentMonthIncome = 0;
    let currentMonthExpense = 0;
    let previousMonthIncome = 0;
    let previousMonthExpense = 0;

    transactions.forEach(transaction => {
      const date = new Date(transaction.createdAt);
      const monthKey = date.toLocaleString('default', { month: 'short' });
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { income: 0, expense: 0 });
      }

      const monthData = monthlyData.get(monthKey);

      if (transaction.toAccount.toString() === accountId) {
        monthData.income += transaction.amount;
        if (monthKey === currentMonth) {
          currentMonthIncome += transaction.amount;
        }
      } else if (transaction.fromAcount?.toString() === accountId) {
        monthData.expense += transaction.amount;
        if (monthKey === currentMonth) {
          currentMonthExpense += transaction.amount;
        }
      }
    });

    // Obtener datos del mes anterior para calcular tendencias
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const previousMonthKey = previousMonth.toLocaleString('default', { month: 'short' });
    const previousMonthData = monthlyData.get(previousMonthKey) || { income: 0, expense: 0 };
    previousMonthIncome = previousMonthData.income;
    previousMonthExpense = previousMonthData.expense;

    // Calcular porcentajes y tendencias
    const incomePercentage = previousMonthIncome === 0 ? 100 : 
      ((currentMonthIncome - previousMonthIncome) / previousMonthIncome) * 100;
    const expensePercentage = previousMonthExpense === 0 ? 100 : 
      ((currentMonthExpense - previousMonthExpense) / previousMonthExpense) * 100;

    monthlyData.forEach((data, month) => {
      labels.push(month);
      incomeData.push(data.income);
      expenseData.push(data.expense);
    });

    res.json({
      labels,
      datasets: [
        {
          label: "Ingresos",
          data: incomeData
        },
        {
          label: "Gastos",
          data: expenseData
        }
      ],
      summary: {
        income: {
          amount: currentMonthIncome,
          percentage: Math.round(incomePercentage),
          trend: incomePercentage >= 0 ? 'up' : 'down'
        },
        expense: {
          amount: currentMonthExpense,
          percentage: Math.round(expensePercentage),
          trend: expensePercentage >= 0 ? 'up' : 'down'
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Error al obtener los datos del gráfico"
    });
  }
};