import Transaction from "./transaction.model.js";
import User from "../users/user.model.js";
import Account from "../accounts/account.model.js";
import Product from "../products/product.model.js";


export const createTransaction = async (req, res) => {
    try {
        const data = req.body;
        const toAccount = await Account.findOne({ accountNo: data.accountNo });
        const fromAccount = await Account.findOne({ user: req.user._id });

        if (data.type === 'PURCHASE') {
            console.log('purchase')
            if (!data.productId) {
                return res.status(400).json({
                    message: "Product ID is required"
                });
            }

            const product = await Product.findById(data.productId);


            if (!fromAccount) {
                return res.status(404).json({
                    message: "Account not found"
                });
            }

            const paymentMethod = data.paymentMethod || 'balance'; // por defecto saldo
            const transaction = new Transaction({
                type: data.type,
                fromAccount: fromAccount._id,
                toAccount: product._id,
                toAccountModel: 'Product',
                amount: Number(product.profitPrice),
                description: "Purchase of " + product.name + " " + product.type
            });

            if (paymentMethod === 'credit') {
                if (fromAccount.availableCredit >= Number(product.profitPrice)) {
                    fromAccount.availableCredit -= Number(product.profitPrice);
                    fromAccount.transactions.push(transaction._id);
                    await fromAccount.save();
                    await transaction.save();
                    return res.status(201).json({
                        transaction,
                        message: "Compra realizada exitosamente usando crédito"
                    });
                } else {
                    return res.status(400).json({
                        message: "Crédito insuficiente para realizar la compra"
                    });
                }
            } else if (paymentMethod === 'balance') {
                if (fromAccount.balance >= Number(product.profitPrice)) {
                    fromAccount.balance -= Number(product.profitPrice);
                    fromAccount.transactions.push(transaction._id);
                    await fromAccount.save();
                    await transaction.save();
                    return res.status(201).json({
                        transaction,
                        message: "Compra realizada exitosamente con saldo"
                    });
                } else {
                    return res.status(400).json({
                        message: "Saldo insuficiente para realizar la compra"
                    });
                }
            } else {
                return res.status(400).json({
                    message: "Método de pago no válido. Usa 'balance' o 'credit'"
                });
            }
        }

        if (data.type === 'TRANSFER') {
            if (!data.accountNo || !data.amount) {
                return res.status(400).json({
                    message: "Destination account number and amount are required"
                });
            }

            const transaction = new Transaction({
                type: data.type,
                fromAccount: fromAccount._id,
                toAccount: toAccount._id,
                toAccountModel: 'Account',
                amount: Number(data.amount),
                description: data.description || "Account transfer"
            });

            fromAccount.balance -= Number(data.amount);
            toAccount.balance += Number(data.amount);
            fromAccount.transactions.push(transaction._id);

            await transaction.save();
            await fromAccount.save();
            await toAccount.save();

            return res.status(201).json({
                transaction,
                message: "Transfer completed successfully"
            });
        }

        if (data.type === 'DEPOSIT') {
            const admin = await User.findById(req.user._id);
            const toAccount = await Account.findOne({ accountNo: data.accountNo });
            
            if (!toAccount) {
                return res.status(404).json({
                    message: "Destination account not found"
                });
            }

            const transaction = new Transaction({
                type: data.type,
                admin: admin._id,
                toAccount: toAccount._id,
                toAccountModel: 'Account',
                amount: Number(data.amount),
                description: data.description || "Account deposit"
            });

            toAccount.balance += Number(data.amount);
            toAccount.transactions.push(transaction._id);

            await transaction.save();
            await toAccount.save();

            return res.status(201).json({
                transaction,
                message: "Deposit completed successfully"
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

        const account = await Account.findOne({accountNo: req.params.id});
        const transactions = await Transaction.find({
            $or: [
                { fromAccount: account._id },
                { toAccount: account._id }
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
        if (!transaction) {
            return res.status(404).json({ message: "Transacción no encontrada" });
        }
        const data = req.body;
        const nuevoMonto = Number(data.amount);
        const montoAnterior = transaction.amount;
        let fromAccount, toAccount;

        if (transaction.type === 'DEPOSIT') {
            toAccount = await Account.findById(transaction.toAccount);
            if (toAccount) {
                toAccount.balance = toAccount.balance - montoAnterior + nuevoMonto;
                await toAccount.save();
            }
        }

        transaction.amount = nuevoMonto || transaction.amount;
        await transaction.save();

        res.status(200).json({
            transaction, 
            message: "Transacción actualizada y saldo ajustado correctamente"
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error al actualizar la transacción",
            error: error.message 
        });
    }
}

export const cancelTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: "Transacción no encontrada" });
        }

        if (transaction.type === 'DEPOSIT' && transaction.status === true) {
            const toAccount = await Account.findById(transaction.toAccount);
            if (toAccount) {
                toAccount.balance -= transaction.amount;
                await toAccount.save();
            }
        }

        transaction.status = false;
        await transaction.save();

        res.status(200).json({
            transaction, 
            message: "Transacción cancelada y saldo revertido correctamente"
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error al cancelar la transacción",
            error: error.message 
        });
    }
}

export const getCredit = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        const account = await Account.findOne({ user: req.user._id });
        const credit = account.creditLimit;
        const creditLeft = account.availableCredit;
        const creditUsed = (credit - creditLeft)*1.10;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        const dateOfPayment = new Date(nextYear, nextMonth, 5);
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
      
      // Crear fecha de inicio más flexible
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - parseInt(months));
      startDate.setDate(1); // Comenzar desde el primer día del mes
      
      
      const transactions = await Transaction.find({
        $or: [
          { fromAccount: accountId },
          { toAccount: accountId }
        ],
        createdAt: { $gte: startDate }
      }).sort({ createdAt: 1 });
      
      console.log('Transacciones encontradas:', transactions.length);
      console.log('Primera transacción:', transactions[0]);
      
      // Si no hay transacciones, buscar sin filtro de fecha para debug
      if (transactions.length === 0) {
        const allTransactions = await Transaction.find({
          $or: [
            { fromAccount: accountId },
            { toAccount: accountId }
          ]
        }).limit(5);
        console.log('Transacciones sin filtro de fecha:', allTransactions.length);
        console.log('Ejemplo de transacción:', allTransactions[0]);
      }
      
      const labels = [];
      const incomeData = [];
      const expenseData = [];
      const monthlyData = new Map();
      
      // Obtener mes actual
      const now = new Date();
      const currentMonth = now.toLocaleString('default', { month: 'short' });
      let currentMonthIncome = 0;
      let currentMonthExpense = 0;
      
      transactions.forEach(transaction => {
        const date = new Date(transaction.createdAt);
        const monthKey = date.toLocaleString('default', { month: 'short' });
        
        console.log(`Procesando transacción: ${transaction._id}, mes: ${monthKey}`);
        
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, { income: 0, expense: 0 });
        }
        
        const monthData = monthlyData.get(monthKey);
        
        // Extraer los IDs de los objetos
        const toAccountId = transaction.toAccount?._id?.toString();
        const fromAccountId = transaction.fromAccount?._id?.toString();
        const accountIdStr = accountId.toString();
        
        console.log(`Comparando: toAccount=${toAccountId}, fromAccount=${fromAccountId}, accountId=${accountIdStr}`);
        
        // Es un ingreso para esta cuenta
        if (toAccountId === accountIdStr) {
          monthData.income += transaction.amount;
          if (monthKey === currentMonth) {
            currentMonthIncome += transaction.amount;
          }
          console.log(`Ingreso agregado: ${transaction.amount}`);
        } 
        // Es un gasto desde esta cuenta
        else if (fromAccountId === accountIdStr) {
          monthData.expense += transaction.amount;
          if (monthKey === currentMonth) {
            currentMonthExpense += transaction.amount;
          }
          console.log(`Gasto agregado: ${transaction.amount}`);
        }
      });
      
      // Calcular mes anterior
      const previousMonth = new Date();
      previousMonth.setMonth(previousMonth.getMonth() - 1);
      const previousMonthKey = previousMonth.toLocaleString('default', { month: 'short' });
      
      const previousMonthData = monthlyData.get(previousMonthKey) || { income: 0, expense: 0 };
      const previousMonthIncome = previousMonthData.income;
      const previousMonthExpense = previousMonthData.expense;
      
      // Calcular porcentajes y tendencias
      const totalCurrentMonth = currentMonthIncome + currentMonthExpense;
      const totalPreviousMonth = previousMonthIncome + previousMonthExpense;

      const incomePercentage = totalCurrentMonth === 0 ? 
        0 : 
        (currentMonthIncome / totalCurrentMonth) * 100;
        
      const expensePercentage = totalCurrentMonth === 0 ? 
        0 : 
        (currentMonthExpense / totalCurrentMonth) * 100;

      // Asegurar que los porcentajes sean números válidos
      const finalIncomePercentage = isNaN(incomePercentage) ? 0 : Math.round(incomePercentage);
      const finalExpensePercentage = isNaN(expensePercentage) ? 0 : Math.round(expensePercentage);
      
      // Generar arrays para el gráfico
      monthlyData.forEach((data, month) => {
        labels.push(month);
        incomeData.push(data.income);
        expenseData.push(data.expense);
      });
      
      console.log('Datos finales:', { labels, incomeData, expenseData });
      
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
            percentage: Math.round(finalIncomePercentage),
            trend: finalIncomePercentage >= 0 ? 'up' : 'down'
          },
          expense: {
            amount: currentMonthExpense,
            percentage: Math.round(finalExpensePercentage),
            trend: finalExpensePercentage >= 0 ? 'up' : 'down'
          }
        }
      });
      
    } catch (error) {
      console.error('Error completo:', error);
      res.status(500).json({
        msg: "Error al obtener los datos del gráfico",
        error: error.message
      });
    }
  };