import Product from './product.model.js';

export const saveProduct = async (req,res) => {
    try {
        const { name, description, enterprise, profitPrice, img } = req.body
        
        const product = new Product({
            name,
            description,
            enterprise,
            profitPrice,
            img
        })

        await product.save()

        return res.status(201).json({
            msg: "Product saved successfully",
            product
        })
    } catch (error) {
        return res.status(500).json({
            msg: "Error saving product",
            error: error.message
        })
    }
}

export const getProducts = async (req,res) => {
    try {
        const query = { status: true }
        const products = await Product.find(query)

        res.status(201).json({
            msg: "Products retrieved successfully",
            products
        })
    } catch (error) {
        return res.status(500).json({
            msg: "Error getting products",
            error: error.message
        })
    }
}

export const searchProduct = async (req,res) => {
    try {
        const { id } = req.params
        const product = await Product.findById(id)

        if (!product) {
            return res.status(404).json({
                msg: "Product not found"
            })
        }

        return res.status(200).json({
            msg: "Product found",
            product
        })
    } catch (error) {
        return res.status(500).json({ 
            msg: "Error searching product",
            error: error.message
        })
    }
}

export const updateProduct = async (req,res) => {
    try {
        const { id } = req.params
        const { ...data } = req.body

        const updatedProduct = await Product.findByIdAndUpdate(id, data, {new:true})

        res.status(200).json({
            msg: "Product updated successfully",
            updatedProduct
        })

    } catch (error) {
        return res.status(500).json({
            msg: "Error updating product",
            error: error.message
        })
    }
}

export const deleteProduct = async (req,res) => {
    try {
        const { id } = req.params
        
        const deletedProduct = await Product.findByIdAndUpdate(id, { status: false }, { new: true })

        return res.status(200).json({
            msg: "Product deleted successfully",
            deletedProduct
        })
    } catch (error) {
        return res.status(500).json({
            msg: "Error deleting product",
            error: error.message
        })
    }
}