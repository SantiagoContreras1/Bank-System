import Product from "./product.model.js";
import cloudinary from "../../config/claudinary.js";

const getPublicIdFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const uploadIndex = pathParts.indexOf('upload');
    if (uploadIndex !== -1 && pathParts[uploadIndex + 2]) {
      return pathParts[uploadIndex + 2].split('.')[0];
    }
  } catch (error) {
    console.error('Error al extraer public_id:', error);
  }
  return null;
};

export const saveProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      enterprise,
      disscountPorcent,
      originalPrice,
    } = req.body
    console.log("BODY:", req.body);

    // Validación robusta de los campos numéricos
    if (
      typeof disscountPorcent === "undefined" ||
      typeof originalPrice === "undefined" ||
      disscountPorcent === "" ||
      originalPrice === "" ||
      isNaN(parseFloat(disscountPorcent)) ||
      isNaN(parseFloat(originalPrice))
    ) {
      return res.status(400).json({
        success: false,
        msg: "Discount and original price must be numbers"
      });
    }

    // Obtener la imagen subida
    const image = req.file ? req.file.path : null;

    const convertDiss = parseFloat(disscountPorcent);
    const finalProfitPrice =
      parseFloat(originalPrice) -
      (parseFloat(originalPrice) * convertDiss) / 100;
    
    if (isNaN(finalProfitPrice)) {
      return res.status(400).json({
        msg: "El precio de ganancia debe ser un número válido",
      });
    }

    // Vlialidar que el profitPrice no sea mayor a 2000
    if (finalProfitPrice > 2000) {
      return res.status(400).json({
        msg: "El precio no puede ser mayor a 2000",
      });
    }

    const product = new Product({
      name,
      description,
      type,
      enterprise,
      disscountPorcent,
      originalPrice,
      img: image,
      profitPrice: finalProfitPrice,
    });

    

    await product.save();

    return res.status(201).json({
      msg: "Product saved successfully",
      product: {
        ...product.toObject(),
        disscountPorcent: convertDiss,
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

    res.status(201).json({
      msg: "Products retrieved successfully",
      products,
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

    return res.status(200).json({
      msg: "Product found",
      product,
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
    const {
      name,
      description,
      type,
      enterprise,
      disscountPorcent,
      originalPrice,
    } = req.body;
    
    // Validación robusta de los campos numéricos
    if (
      typeof disscountPorcent === "undefined" ||
      typeof originalPrice === "undefined" ||
      disscountPorcent === "" ||
      originalPrice === "" ||
      isNaN(parseFloat(disscountPorcent)) ||
      isNaN(parseFloat(originalPrice))
    ) {
      return res.status(400).json({
        success: false,
        msg: "Discount and original price must be numbers"
      });
    }
      
    const product = await Product.findById(id);
    if (!product) {
        return res.status(404).json({
            msg: "Product not found"
        })
    }

    // Manejar la imagen existente
    let imageUrl = product.img;
    
    // Si se sube una nueva imagen, eliminar la anterior de Cloudinary
    if (req.file) {
      // Eliminar imagen anterior si existe
      if (product.img) {
        const publicId = getPublicIdFromUrl(product.img);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (error) {
            console.error(`Error eliminando imagen anterior ${publicId}:`, error);
          }
        }
      }
      // Usar la nueva imagen
      imageUrl = req.file.path;
    }
    const discountPercent = parseFloat(disscountPorcent);
    const profitPrice = parseFloat(originalPrice) - (parseFloat(originalPrice) * discountPercent) / 100;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        description,
        type,
        enterprise,
        disscountPorcent,
        profitPrice,
        originalPrice,
        img: imageUrl,
      },
      { new: true }
    );

    const convertDiss = parseFloat(disscountPorcent);
    const finalProfitPrice =
      parseFloat(originalPrice) -
      (parseFloat(originalPrice) * convertDiss) / 100;

    res.status(200).json({
      msg: "Product updated successfully",
      updatedProduct: {
          ...updatedProduct.toObject(),
          disscountPorcent: convertDiss,
          profitPrice: finalProfitPrice
      }
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

export const getActiveProductsCount = async (req, res) => {
  try {
    const count = await Product.countDocuments({ status: true });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
