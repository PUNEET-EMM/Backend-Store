import express from 'express';
import { authenticateInternalUser } from "../../middleware/crm/authMiddleware.js"
import { createProduct } from '../../controllers/crm/productController.js';
import { validateProductCreation } from '../../validations/crm/productVaildation.js';


const router = express.Router();
router.use(authenticateInternalUser);


router.post("/products", validateProductCreation, createProduct);
// router.get("/products", getAllProducts);
// router.get("/products/:id", getProductById);
// router.put("/products/:id", updateProduct);
// router.delete("/products/:id", deleteProduct);





export default router;
