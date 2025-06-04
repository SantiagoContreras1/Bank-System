import axios from 'axios';
import Account from '../users/user.model';

const MONEDAS_PERMITIDAS = ['USD', 'EUR', 'MXN', 'JPY', 'GBP', 'CAD'];

export const convertirBalancePorMoneda = async (req, res) => {
  const { accountNo, moneda } = req.params;
  const monedaDestino = moneda.toUpperCase();
  const API_KEY = process.env.CURRENCYFREAKS_API_KEY;

  try {
    // 1. Validar moneda
    if (!MONEDAS_PERMITIDAS.includes(monedaDestino)) {
      return res.status(400).json({ 
        error: 'Moneda no permitida', 
        permitidas: MONEDAS_PERMITIDAS 
      });
    }

    // 2. Buscar la cuenta
    const cuenta = await Account.findOne({ accountNo });

    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    const balanceGTQ = cuenta.balance;

    // 3. Llamar a la API de CurrencyFreaks
    const response = await axios.get('https://api.currencyfreaks.com/latest', {
      params: {
        apikey: API_KEY,
        base: 'GTQ'
      }
    });

    const tasa = parseFloat(response.data.rates[monedaDestino]);

    if (isNaN(tasa)) {
      return res.status(400).json({ error: 'Error al obtener tasa de cambio' });
    }

    const balanceConvertido = parseFloat(balanceGTQ * tasa).toFixed(2);

    return res.json({
      accountNo,
      monedaDestino,
      balance_GTQ: balanceGTQ,
      balanceConvertido
    });

  } catch (error) {
    console.error('Error al convertir balance:', error.message);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};
