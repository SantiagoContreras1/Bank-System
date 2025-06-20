import Product from "./product.model.js";

import multer from "multer";


export const saveProduct = async (req, res) => {
  console.log(req.body)
  console.log(req.file)
  try {
    const {
      name,
      description,
      type,
      enterprise,
      disscountPorcent,
      originalPrice,
    } = req.body;

    const img = req.file ? req.file.path : null;

    const convertDiss = parseFloat(req.body.disscountPorcent);
    const finalProfitPrice =
      parseFloat(req.body.originalPrice) -
      (parseFloat(req.body.originalPrice) * convertDiss) / 100;

    const product = new Product({
      name,
      description,
      type,
      enterprise,
      disscountPorcent: convertDiss,
      originalPrice,
      profitPrice: finalProfitPrice,
      img,
    });

    await product.save();

    return res.status(201).json({
      msg: "Product saved successfully",
      product: {
        ...product.toObject(),
        profitPrice: finalProfitPrice,
      },
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Error saving product",
      error: error.message,
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const query = { status: true };
    const products = await Product.find(query);

    // Calcular profitPrice para cada producto
    const productsWithProfit = products.map((product) => {
      const original = parseFloat(product.originalPrice);
      const disscount = parseFloat(product.disscountPorcent);
      const profitPrice = original - (original * disscount) / 100;

      return {
        ...product.toObject(),
        profitPrice,
      };
    });

    res.status(200).json({
      msg: "Products retrieved successfully",
      products: productsWithProfit,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Error getting products",
      error: error.message,
    });
  }
};

export const searchProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        msg: "Product not found",
      });
    }

    const original = parseFloat(product.originalPrice);
    const disscount = parseFloat(product.disscountPorcent);
    const profitPrice = original - (original * disscount) / 100;

    return res.status(200).json({
      msg: "Product found",
      product: {
        ...product.toObject(),
        profitPrice,
      },
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Error searching product",
      error: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    const {
      name,
      description,
      type,
      enterprise,
      disscountPorcent,
      originalPrice,
    } = req.body;

    const img = req.file ? req.file.filename : product.img;

    const convertDiss = parseFloat(disscountPorcent);
    const finalProfitPrice =
      parseFloat(originalPrice) -
      (parseFloat(originalPrice) * convertDiss) / 100;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        description,
        type,
        enterprise,
        disscountPorcent: convertDiss,
        originalPrice,
        profitPrice: finalProfitPrice,
        img
      },
      { new: true }
    );

    res.status(200).json({
      msg: "Product updated successfully",
      updatedProduct: {
        ...updatedProduct.toObject(),
        profitPrice: finalProfitPrice,
      },
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Error updating product",
      error: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndUpdate(
      id,
      { status: false },
      { new: true }
    );

    return res.status(200).json({
      msg: "Product deleted successfully",
      deletedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Error deleting product",
      error: error.message,
    });
  }
};
