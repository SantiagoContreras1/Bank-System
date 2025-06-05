import axios from 'axios';
import Account from '../accounts/account.model.js';

const MONEDAS_PERMITIDAS = ['USD', 'EUR', 'MXN', 'JPY', 'GBP', 'CAD'];
const API_KEY = '7a9635bac2594c1f9420cea3e95f006b';

export const convertirBalancePorMoneda = async (req, res) => {
  const { accountNo, moneda } = req.params;
  const monedaDestino = moneda.toUpperCase();

  try {
    // Validar moneda permitida
    if (!MONEDAS_PERMITIDAS.includes(monedaDestino)) {
      return res.status(400).json({
        error: 'Moneda no permitida',
        permitidas: MONEDAS_PERMITIDAS
      });
    }

    // Validar número de cuenta
    if (!accountNo || isNaN(accountNo)) {
      return res.status(400).json({ error: 'Número de cuenta inválido' });
    }

    // Buscar la cuenta
    const cuenta = await Account.findOne({ accountNo: Number(accountNo) });
    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    const balanceGTQ = parseFloat(cuenta.balance);
    if (isNaN(balanceGTQ)) {
      return res.status(400).json({ error: 'Balance inválido en cuenta' });
    }

    // Obtener tasas desde USD
    const response = await axios.get('https://api.currencyfreaks.com/v2.0/rates/latest', {
      params: {
        apikey: API_KEY,
        base: 'USD'
      }
    });

    const rates = response.data.rates;

    // Validar que tengamos tasa USD -> GTQ y USD -> monedaDestino
    const rateUSDToGTQ = parseFloat(rates['GTQ']);
    const rateUSDToDestino = parseFloat(rates[monedaDestino]);

    if (isNaN(rateUSDToGTQ) || isNaN(rateUSDToDestino) || rateUSDToGTQ <= 0 || rateUSDToDestino <= 0) {
      return res.status(400).json({
        error: `Tasa de conversión no válida`
      });
    }

    // Convertir de GTQ a USD (invirtiendo tasa USD -> GTQ)
    const balanceUSD = balanceGTQ / rateUSDToGTQ;

    // Convertir de USD a moneda destino
    const balanceConvertido = (balanceUSD * rateUSDToDestino).toFixed(2);

    return res.json({
      accountNo: cuenta.accountNo,
      balance_GTQ: balanceGTQ,
      monedaDestino,
      tasa_de_Conversion: rateUSDToDestino,
      balanceConvertido
    });

  } catch (error) {
    console.error('❌ Error al convertir balance:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
