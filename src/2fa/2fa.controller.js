import speakeasy from "speakeasy";
import qrcode from "qrcode";

export const start2FA = async (req, res) => {
  try {
    const user = req.user;
    const secret = speakeasy.generateSecret({ name: `Nova Bank ${user.name}`, length: 20 });

    user.twoFactorSecret = secret.base32;
    await user.save();
    
    const qrCode = await qrcode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      success: true,
      msg: "2FA started successfully",
      qrCode,
      manualEntryKey: secret.base32,
    });
  } catch (error) {
    console.error("Error en start2FA:", error);
    res.status(500).json({
      success: false,
      msg: "Error starting 2FA",
      error: error.message,
    });
  }
};

export const verify2FA = async (req, res) => {
  try {
    const { twoFactorCode } = req.body;
    const user = req.user;

    if (!user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        msg: "No se ha configurado el 2FA para este usuario",
      });
    }

    // Limpiamos el código de posibles espacios o caracteres no deseados
    const cleanCode = twoFactorCode.toString().trim();
    
    if (cleanCode.length !== 6) {
      return res.status(400).json({
        success: false,
        msg: "El código 2FA debe tener exactamente 6 dígitos",
      });
    }

    console.log('Código 2FA recibido:', cleanCode);
    console.log('Secreto almacenado:', user.twoFactorSecret);

    // Intentamos verificar con diferentes ventanas de tiempo
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: cleanCode,
      window: 3, // Aumentamos la ventana para dar más margen
      step: 30, // Aseguramos que el paso sea de 30 segundos
    });

    console.log('Resultado de verificación:', verified);

    if (!verified) {
      // Generamos un código de prueba para verificar que el secreto es válido
      const testToken = speakeasy.totp({
        secret: user.twoFactorSecret,
        encoding: "base32",
      });
      
      console.log('Código de prueba generado:', testToken);
      
      return res.status(401).json({
        success: false,
        msg: "Código 2FA inválido o expirado",
        hint: "Asegúrate de que el código sea el más reciente y que la hora de tu dispositivo esté sincronizada"
      });
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.status(200).json({
      success: true,
      msg: "2FA verificado exitosamente",
    });

  } catch (error) {
    console.error("Error en verify2FA:", error);
    res.status(500).json({
      success: false,
      msg: "Error al verificar 2FA",
      error: error.message,
    });
  }
}