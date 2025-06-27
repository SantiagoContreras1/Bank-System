import Transaction from '../transactions/transaction.model.js';
import Account from '../accounts/account.model.js';
import User from '../users/user.model.js';
import { startOfDay, endOfDay, subDays, format, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

export const getDailySummary = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    // Obtener transacciones del día
    const todayTransactions = await Transaction.find({
      createdAt: {
        $gte: startOfToday,
        $lte: endOfToday
      },
      status: true
    });

    // Calcular totales por tipo
    const deposits = todayTransactions
      .filter(t => t.type === 'DEPOSIT')
      .reduce((sum, t) => sum + t.amount, 0);

    const purchases = todayTransactions
      .filter(t => t.type === 'PURCHASE')
      .reduce((sum, t) => sum + t.amount, 0);

    const transfers = todayTransactions
      .filter(t => t.type === 'TRANSFER')
      .reduce((sum, t) => sum + t.amount, 0);

    const total = todayTransactions.reduce((sum, t) => sum + t.amount, 0);

    res.json({
      success: true,
      data: {
        deposits,
        purchases,
        transfers,
        total,
        count: todayTransactions.length
      }
    });
  } catch (error) {
    console.error('Error al obtener resumen diario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener datos para gráficos por rango de fechas
export const getChartData = async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    const today = new Date();
    let startDate;

    // Calcular fecha de inicio según el rango
    switch(timeRange) {
      case "180d":
        startDate = subDays(today, 180);
        break;
      case "90d":
        startDate = subDays(today, 90);
        break;
      case "30d":
        startDate = subDays(today, 30);
        break;
      case "7d":
        startDate = subDays(today, 7);
        break;
      default:
        startDate = subDays(today, 7);
    }

    // Obtener transacciones en el rango de fechas
    const transactions = await Transaction.find({
      createdAt: {
        $gte: startDate,
        $lte: today
      },
      status: true
    }).sort({ createdAt: 1 });

    // Agrupar por fecha
    const groupedData = {};
    
    transactions.forEach(transaction => {
      const dateKey = format(transaction.createdAt, 'yyyy-MM-dd');
      
      if (!groupedData[dateKey]) {
        groupedData[dateKey] = {
          date: dateKey,
          deposit: 0,
          purchase: 0,
          transfer: 0
        };
      }

      switch(transaction.type) {
        case 'DEPOSIT':
          groupedData[dateKey].deposit += transaction.amount;
          break;
        case 'PURCHASE':
          groupedData[dateKey].purchase += transaction.amount;
          break;
        case 'TRANSFER':
          groupedData[dateKey].transfer += transaction.amount;
          break;
      }
    });

    // Convertir a array y ordenar por fecha
    const chartData = Object.values(groupedData).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    res.json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error('Error al obtener datos del gráfico:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener cuentas con más movimientos
export const getTopAccounts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Obtener cuentas con más transacciones
    const accounts = await Account.aggregate([
      {
        $match: { status: true }
      },
      {
        $lookup: {
          from: 'transactions',
          localField: '_id',
          foreignField: 'fromAccount',
          as: 'transactions'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          accountNo: 1,
          balance: 1,
          transactionCount: { $size: '$transactions' },
          totalAmount: {
            $sum: '$transactions.amount'
          },
          userName: '$userInfo.name',
          userEmail: '$userInfo.email',
          lastTransaction: {
            $max: '$transactions.createdAt'
          }
        }
      },
      {
        $sort: { transactionCount: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    // Formatear respuesta
    const formattedAccounts = accounts.map(account => ({
      id: account._id,
      name: account.userName,
      accountNo: account.accountNo,
      transactions: account.transactionCount,
      totalAmount: account.totalAmount || 0,
      balance: account.balance,
      lastTransaction: account.lastTransaction ? 
        format(account.lastTransaction, 'yyyy-MM-dd HH:mm') : 
        'Sin transacciones',
      trend: account.transactionCount > 5 ? 'up' : 'down'
    }));

    res.json({
      success: true,
      data: formattedAccounts
    });
  } catch (error) {
    console.error('Error al obtener cuentas principales:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener historial de transacciones recientes
export const getRecentTransactions = async (req, res) => {
  try {
    const { limit = 20, type } = req.query;

    let query = { status: true };
    
    if (type) {
      query.type = type.toUpperCase();
    }

    // Usar aggregate para obtener información completa
    const transactions = await Transaction.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'accounts',
          localField: 'fromAccount',
          foreignField: '_id',
          as: 'fromAccountInfo'
        }
      },
      {
        $lookup: {
          from: 'accounts',
          localField: 'toAccount',
          foreignField: '_id',
          as: 'toAccountInfo'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'fromAccountInfo.user',
          foreignField: '_id',
          as: 'fromUserInfo'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'toAccountInfo.user',
          foreignField: '_id',
          as: 'toUserInfo'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'admin',
          foreignField: '_id',
          as: 'adminInfo'
        }
      },
      {
        $addFields: {
          fromAccount: { $arrayElemAt: ['$fromAccountInfo', 0] },
          toAccount: { $arrayElemAt: ['$toAccountInfo', 0] },
          fromUser: { $arrayElemAt: ['$fromUserInfo', 0] },
          toUser: { $arrayElemAt: ['$toUserInfo', 0] },
          admin: { $arrayElemAt: ['$adminInfo', 0] }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    console.log('Transacciones encontradas:', transactions.length);

    // Formatear respuesta
    const formattedTransactions = transactions.map(transaction => {
      console.log('Transaction:', {
        type: transaction.type,
        fromAccount: transaction.fromAccount,
        toAccount: transaction.toAccount,
        fromUser: transaction.fromUser,
        toUser: transaction.toUser
      });
      
      let client = 'N/A';
      let clientAccount = null;

      if (transaction.type === 'DEPOSIT') {
        // Para depósitos, el cliente es quien recibe (toAccount)
        if (transaction.toUser) {
          client = transaction.toUser.name || 'N/A';
          clientAccount = transaction.toAccount?.accountNo;
        } else if (transaction.toAccount) {
          client = 'Cliente (Cuenta: ' + transaction.toAccount.accountNo + ')';
          clientAccount = transaction.toAccount.accountNo;
        }
      } else if (transaction.type === 'TRANSFER') {
        // Para transferencias, el cliente es quien envía (fromAccount)
        if (transaction.fromUser) {
          client = transaction.fromUser.name || 'N/A';
          clientAccount = transaction.fromAccount?.accountNo;
        } else if (transaction.fromAccount) {
          client = 'Cliente (Cuenta: ' + transaction.fromAccount.accountNo + ')';
          clientAccount = transaction.fromAccount.accountNo;
        }
      } else if (transaction.type === 'PURCHASE') {
        if (transaction.fromUser) {
          client = transaction.fromUser.name || 'N/A';
          clientAccount = transaction.fromAccount?.accountNo;
        } else if (transaction.fromAccount) {
          client = 'Cliente (Cuenta: ' + transaction.fromAccount.accountNo + ')';
          clientAccount = transaction.fromAccount.accountNo;
        }
      }

      return {
        id: transaction._id,
        type: transaction.type === 'DEPOSIT' ? 'Depósito' : 
              transaction.type === 'PURCHASE' ? 'Compra' : 'Transferencia',
        amount: transaction.amount,
        date: format(transaction.createdAt, 'yyyy-MM-dd HH:mm'),
        status: transaction.status ? 'Completado' : 'Pendiente',
        client: client,
        clientAccount: clientAccount,
        description: transaction.description,
        fromAccount: transaction.fromAccount?.accountNo || 'N/A',
        toAccount: transaction.toAccount?.name || transaction.toAccount?.accountNo || 'N/A',
        admin: transaction.admin?.name || 'N/A'
      };
    });

    console.log('Transacciones formateadas:', formattedTransactions.length);

    res.json({
      success: true,
      data: formattedTransactions
    });
  } catch (error) {
    console.error('Error al obtener transacciones recientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas generales del sistema
export const getSystemStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Contar usuarios activos
    const activeUsers = await User.countDocuments({ status: true });
    
    // Contar cuentas activas
    const activeAccounts = await Account.countDocuments({ status: true });
    
    // Contar transacciones del día
    const todayTransactions = await Transaction.countDocuments({
      createdAt: { $gte: startOfToday },
      status: true
    });

    // Contar transacciones del mes
    const monthTransactions = await Transaction.countDocuments({
      createdAt: { $gte: startOfMonth },
      status: true
    });

    // Total de transacciones del día
    const todayTotal = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfToday },
          status: true
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Total de transacciones del mes
    const monthTotal = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
          status: true
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        activeUsers,
        activeAccounts,
        todayTransactions,
        monthTransactions,
        todayTotal: todayTotal[0]?.total || 0,
        monthTotal: monthTotal[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del sistema:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Nuevo endpoint: transacciones por mes del último año
export const getMonthlyTransactionCounts = async (req, res) => {
  try {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear() - 1, today.getMonth() + 1, 1); // Hace 12 meses

    // Agrupar por mes y contar transacciones
    const monthlyCounts = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear, $lte: today },
          status: true
        }
      },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Formatear resultado para devolver nombre del mes y año
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const result = monthlyCounts.map(item => ({
      year: item._id.year,
      month: item._id.month,
      monthName: months[item._id.month - 1],
      count: item.count
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error al obtener transacciones por mes:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
