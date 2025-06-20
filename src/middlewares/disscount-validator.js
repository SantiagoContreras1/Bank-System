export const validateDisscount = async (req, res, next) => {
  try {
    let { disscountPorcent, originalPrice } = req.body;

    // Parsear a float si vienen como string (de un formulario multipart/form-data)
    disscountPorcent = parseFloat(disscountPorcent);
    originalPrice = parseFloat(originalPrice);

    console.log("🔍 Validando:", { disscountPorcent, originalPrice });

    if (isNaN(disscountPorcent) || isNaN(originalPrice)) {
      return res.status(400).json({
        success: false,
        msg: "Discount and original price must be numbers",
      });
    }

    if (disscountPorcent < 0 || disscountPorcent > 100) {
      return res.status(400).json({
        success: false,
        msg: "Discount percentage must be between 0 and 100",
      });
    }

    if (disscountPorcent > originalPrice) {
      return res.status(400).json({
        success: false,
        msg: "Discount percentage cannot be greater than the original price",
      });
    }

    next();
  } catch (error) {
    return new Error("Error validating discount");
  }
};
