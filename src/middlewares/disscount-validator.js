
export const validateDisscount = async (req,res,next) => {
    try {
        const { disscountPorcent, originalPrice } = req.body

        if (disscountPorcent < 0 || disscountPorcent > 100) {
            return res.status(400).json({
                success: false,
                msg: "Discount percentage must be between 0 and 100"
            });
        }

        if (disscountPorcent > originalPrice) {
            return res.status(400).json({
                success: false,
                msg: "Discount percentage cannot be greater than the original price"
            });
        }

        next()
    } catch (error) {
        return new Error("Error validating discount");
    }
}