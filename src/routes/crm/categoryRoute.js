import express from 'express';
import { authenticateInternalUser } from "../../middleware/crm/authMiddleware.js"
import { validateCategoryCreation,validateSubCategoryCreation } from "../../validations/crm/categoryValidation.js"
import {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    addSubCategory,
    getSubCategories,
    updateSubCategory
} from '../../controllers/crm/categoryController.js';

const router = express.Router();
router.use(authenticateInternalUser);


router.post("/categories", validateCategoryCreation, createCategory);
router.get("/categories", getAllCategories);
router.get("/categories/:id", getCategoryById);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);


//Sub category
router.post(
  "/categories/:categoryId/subcategories",
  validateSubCategoryCreation,
  addSubCategory
);
router.get("/categories/:categoryId/subcategories", getSubCategories);
router.put("/categories/:categoryId/subcategories/:subCategoryId", updateSubCategory);
// router.delete("/categories/:categoryId/subcategories/:subCategoryId", deleteSubCategory);



export default router;
