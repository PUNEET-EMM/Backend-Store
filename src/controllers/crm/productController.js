import { Category } from "../../models/Category.js";
import { Product } from "../../models/Product.js";
import { sendError, success } from "../../utils/apiResponse.js";
import logger from "../../utils/logger.js";



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
      categoryName: category.slug,
      subCategoryName: subcategory.slug,
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


export const getAllProducts = async (req, res) => {
  try {
    const {
      categoryId,
      subCategoryId,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 20,
      sort = "-createdAt",
    } = req.query;

    const query = {
      isActive: true,
    };

    if (categoryId) query.categoryId = categoryId;
    if (subCategoryId) query.subCategoryId = subCategoryId;

    if (minPrice || maxPrice) {
      query.sellingPrice = {};
      if (minPrice) query.sellingPrice.$gte = Number(minPrice);
      if (maxPrice) query.sellingPrice.$lte = Number(maxPrice);
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .populate("categoryId", "name slug")
      .populate("createdBy", "name email")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    return success(
      res,
      {
        products,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
      "Products fetched successfully"
    );
  } catch (error) {
    logger.mongo("error", "Get products error", {
      message: error.message,
    });
    return sendError(res, "Failed to fetch products", 500, error.message);
  }
};



export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("categoryId")
      .populate("createdBy", "name email");

    if (!product) {
      return sendError(res, "Product not found", 404);
    }

    //  stats.views is disabled in schema
    // product.stats.views += 1;
    // await product.save();

    return success(res, product, "Product fetched successfully");
  } catch (error) {
    logger.mongo("error", "Get product error", {
      message: error.message,
    });
    return sendError(res, "Failed to fetch product", 500, error.message);
  }
};




export const updateProduct = async (req, res) => {
  try {
    const updateData = req.validatedData;

    // Get existing product first
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return sendError(res, "Product not found", 404);
    }

    // If variants are being updated, auto-generate SKUs for new variants
    if (updateData.variants) {
      updateData.variants = updateData.variants.map((variant, index) => ({
        ...variant,
        // Keep existing SKU if variant has one, otherwise generate new
        sku: variant.sku || generateVariantSKU(existingProduct.sku, index),
      }));
    }

    // If category/subcategory is being updated, validate and update names
    if (updateData.categoryId || updateData.subCategoryId) {
      const categoryId = updateData.categoryId || existingProduct.categoryId;
      const subCategoryId = updateData.subCategoryId || existingProduct.subCategoryId;

      const category = await Category.findById(categoryId);
      if (!category) {
        return sendError(res, "Category not found", 404);
      }

      const subcategory = category.subcategories.id(subCategoryId);
      if (!subcategory) {
        return sendError(res, "Subcategory not found", 404);
      }

      updateData.categoryName = category.name;
      updateData.subCategoryName = subcategory.name;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    logger.mongo("info", "Product updated successfully", {
      productId: product._id,
    });

    return success(res, product, "Product updated successfully");
  } catch (error) {
    logger.mongo("error", "Update product error", {
      message: error.message,
    });
    return sendError(res, "Failed to update product", 500, error.message);
  }
};


export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return sendError(res, "Product not found", 404);
    }

    // Update category/subcategory stats
    const category = await Category.findById(product.categoryId);
    if (category) {
      const subcategory = category.subcategories.id(product.subCategoryId);
      if (subcategory) {
        subcategory.stats.productsCount = Math.max(
          0,
          subcategory.stats.productsCount - 1
        );
      }
      category.stats.productsCount = Math.max(
        0,
        category.stats.productsCount - 1
      );
      await category.save();
    }

    logger.mongo("info", "Product deleted successfully", {
      productId: req.params.id,
    });

    return success(res, null, "Product deleted successfully");
  } catch (error) {
    logger.mongo("error", "Delete product error", {
      message: error.message,
    });
    return sendError(res, "Failed to delete product", 500, error.message);
  }
};