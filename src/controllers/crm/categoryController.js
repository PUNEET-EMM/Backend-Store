import { Category } from "../../models/Category.js";
import { sendError, success } from "../../utils/apiResponse.js";
import logger from "../../utils/logger.js";

// ============================================
// CATEGORY CONTROLLERS
// ============================================

export const createCategory = async (req, res) => {
  try {
    const { name, imageUrl, displayOrder } = req.validatedData;

    logger.mongo("info", "Category creation attempt", { name });

    const category = new Category({
      name,
      imageUrl,
      displayOrder,
      subcategories: [],
      createdBy: req.user._id,
    });

    await category.save();

    logger.mongo("info", "Category created successfully", {
      categoryId: category._id,
      name,
    });

    return success(res, category, "Category created successfully", 201);
  } catch (error) {
    logger.mongo("error", "Category creation error", {
      message: error.message,
      stack: error.stack,
    });
    return sendError(res, "Failed to create category", 500, error.message);
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ displayOrder: 1 })
      .populate("createdBy", "name email");

    return success(res, {
      categories,
      count: categories.length
    }, "Categories fetched successfully");
  } catch (error) {
    logger.mongo("error", "Get categories error", {
      message: error.message,
    });
    return sendError(res, "Failed to fetch categories", 500, error.message);
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate("createdBy", "name email");

    if (!category) {
      return sendError(res, "Category not found", 404);
    }

    return success(res, category, "Category fetched successfully");
  } catch (error) {
    logger.mongo("error", "Get category error", {
      message: error.message,
    });
    return sendError(res, "Failed to fetch category", 500, error.message);
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, imageUrl, displayOrder } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return sendError(res, "Category not found", 404);
    }

    if (name !== undefined) category.name = name;
    if (imageUrl !== undefined) category.imageUrl = imageUrl;
    if (displayOrder !== undefined) category.displayOrder = displayOrder;

    await category.save();

    logger.mongo("info", "Category updated successfully", {
      categoryId: category._id,
    });

    return success(res, category, "Category updated successfully");
  } catch (error) {
    logger.mongo("error", "Update category error", {
      message: error.message,
    });
    return sendError(res, "Failed to update category", 500, error.message);
  }
};


export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return sendError(res, "Category not found", 404);
    }

    // DELETE ALL PRODUCTS in this category
    // const deletedProducts = await Product.deleteMany({
    //   categoryId: req.params.id,
    // });

    // DELETE THE CATEGORY
    await Category.findByIdAndDelete(req.params.id);

    logger.mongo("info", "Category deleted successfully", {
      categoryId: req.params.id,
      subcategoriesDeleted: category.subcategories.length,
      productsDeleted: deletedProducts.deletedCount,
    });

    return success(res, {
      categoryDeleted: true,
      subcategoriesDeleted: category.subcategories.length,
      productsDeleted: deletedProducts.deletedCount,
    }, "Category deleted successfully");
  } catch (error) {
    logger.mongo("error", "Delete category error", {
      message: error.message,
    });
    return sendError(res, "Failed to delete category", 500, error.message);
  }
};

// ============================================
// SUBCATEGORY CONTROLLERS
// ============================================

export const addSubCategory = async (req, res) => {
  try {
    const { name, imageUrl, displayOrder } = req.validatedData;
    const categoryId = req.params.categoryId;

    const category = await Category.findById(categoryId);

    if (!category) {
      return sendError(res, "Category not found", 404);
    }

    const newSubCategory = {
      name,
      imageUrl,
      displayOrder,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    };

    category.subcategories.push(newSubCategory);
    await category.save();

    const addedSubCategory = category.subcategories[category.subcategories.length - 1];

    logger.mongo("info", "Subcategory added successfully", {
      categoryId,
      subcategoryId: addedSubCategory._id,
      name,
    });

    return success(res, addedSubCategory, "Subcategory added successfully", 201);
  } catch (error) {
    logger.mongo("error", "Add subcategory error", {
      message: error.message,
    });
    return sendError(res, "Failed to add subcategory", 500, error.message);
  }
};

export const getSubCategories = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);

    if (!category) {
      return sendError(res, "Category not found", 404);
    }

    const activeSubcategories = category.subcategories.filter((sub) => sub.isActive);

    return success(res, {
      subcategories: activeSubcategories,
      count: activeSubcategories.length
    }, "Subcategories fetched successfully");
  } catch (error) {
    logger.mongo("error", "Get subcategories error", {
      message: error.message,
    });
    return sendError(res, "Failed to fetch subcategories", 500, error.message);
  }
};

export const updateSubCategory = async (req, res) => {
  try {
    const { name, displayOrder, imageUrl } = req.body;

    const category = await Category.findById(req.params.categoryId);

    if (!category) {
      return sendError(res, "Category not found", 404);
    }

    const subcategory = category.subcategories.id(req.params.subCategoryId);

    if (!subcategory) {
      return sendError(res, "Subcategory not found", 404);
    }

    if (name) {
      subcategory.name = name;
      subcategory.slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    if (displayOrder) subcategory.displayOrder = displayOrder;
    if (imageUrl) subcategory.imageUrl = imageUrl;

    await category.save();

    logger.mongo("info", "Subcategory updated successfully", {
      categoryId: req.params.categoryId,
      subcategoryId: req.params.subCategoryId,
    });

    return success(res, subcategory, "Subcategory updated successfully");
  } catch (error) {
    logger.mongo("error", "Update subcategory error", {
      message: error.message,
    });
    return sendError(res, "Failed to update subcategory", 500, error.message);
  }
};

// export const deleteSubCategory = async (req, res) => {
//   try {
//     const category = await Category.findById(req.params.categoryId);

//     if (!category) {
//       return sendError(res, "Category not found", 404);
//     }

//     const subcategory = category.subcategories.id(req.params.subCategoryId);

//     if (!subcategory) {
//       return sendError(res, "Subcategory not found", 404);
//     }

//     // DELETE ALL PRODUCTS in this subcategory
//     // const deletedProducts = await Product.deleteMany({
//     //   categoryId: req.params.categoryId,
//     //   subCategoryId: req.params.subCategoryId,
//     // });

//     // REMOVE SUBCATEGORY
//     subcategory.deleteOne();
//     await category.save();

//     logger.mongo("info", "Subcategory deleted successfully", {
//       categoryId: req.params.categoryId,
//       subcategoryId: req.params.subCategoryId,
//       productsDeleted: deletedProducts.deletedCount,
//     });

//     return success(res, {
//       subcategoryDeleted: true,
//       productsDeleted: deletedProducts.deletedCount,
//     }, "Subcategory deleted successfully");
//   } catch (error) {
//     logger.mongo("error", "Delete subcategory error", {
//       message: error.message,
//     });
//     return sendError(res, "Failed to delete subcategory", 500, error.message);
//   }
// };














