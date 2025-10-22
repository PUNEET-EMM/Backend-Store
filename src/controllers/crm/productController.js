import { Category } from "../../models/Category.js";
import { Product } from "../../models/Product.js";
import { sendError, success } from "../../utils/apiResponse.js";


const generateSKU = async (categorySlug, subCategorySlug) => {
  // Format: CAT-SUBCAT-TIMESTAMP-RANDOM
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  const catPrefix = categorySlug.substring(0, 3).toUpperCase();
  const subPrefix = subCategorySlug.substring(0, 3).toUpperCase();
  
  return `${catPrefix}-${subPrefix}-${timestamp}-${random}`;
};


const generateVariantSKU = (mainProductSKU, variantIndex) => {
  // Format: MAIN-SKU-V01, MAIN-SKU-V02.
  const variantNumber = (variantIndex + 1).toString().padStart(2, '0');
  return `${mainProductSKU}-V${variantNumber}`;
};



export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      categoryId,
      subCategoryId,
      mrp,
      sellingPrice,
      discountPercent,
      gstPercent,
      marginPercent,
      currency,
      variants,
      images,
      isActive,
    } = req.validatedData;


    const category = await Category.findById(categoryId);
    if (!category) {
      return sendError(res, "Category not found", 404);
    }

    // Validate subcategory exists
    const subcategory = category.subcategories.id(subCategoryId);
    if (!subcategory) {
      return sendError(res, "Subcategory not found", 404);
    }

    // Auto-generate SKU
    const sku = await generateSKU(category.slug, subcategory.slug);

    // Check for existing SKU (just in case)
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      logger.mongo("warn", "Product SKU collision", { sku });
      return sendError(res, "SKU generation conflict. Please retry.", 409);
    }

    // Auto-generate variant SKUs if variants are provided
    const processedVariants = variants?.map((variant, index) => ({
      ...variant,
      sku: generateVariantSKU(sku, index),
    })) || [];

    // Create product
    const product = new Product({
      sku,
      name,
      description,
      categoryId,
      subCategoryId,
      categoryName: category.name,
      subCategoryName: subcategory.name,
      mrp,
      sellingPrice,
      discountPercent: discountPercent || 0,
      gstPercent: gstPercent || 0,
      marginPercent: marginPercent || 0,
      currency: currency || "INR",
      variants: processedVariants,
      images,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id,
    });

    await product.save();

    // Update subcategory stats
    subcategory.stats.productsCount += 1;
    category.stats.productsCount += 1;
    await category.save();

    logger.mongo("info", "Product created successfully", {
      productId: product._id,
      sku,
    });

    return success(res, product, "Product created successfully", 201);
  } catch (error) {
    logger.mongo("error", "Product creation error", {
      message: error.message,
      stack: error.stack,
    });
    return sendError(res, "Failed to create product", 500, error.message);
  }
};