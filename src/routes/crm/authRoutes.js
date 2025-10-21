import express from 'express';
import { validateRegistration, validateLogin } from '../../validations/crm/internalUserValidation.js';
import { registerInternalUser, loginInternalUser } from '../../controllers/crm/internalUserController.js';
import { authenticateInternalUser } from '../../middleware/crm/authMiddleware.js';

const router = express.Router();

// Public routes
router.post("/register", validateRegistration, registerInternalUser);
router.post("/login", validateLogin, loginInternalUser);

// Protected routes (require authentication)
// router.get("/profile", authenticateInternalUser, (req, res) => {
//   res.json({
//     success: true,
//     data: {
//       id: req.user._id,
//       name: req.user.name,
//       email: req.user.email,
//       contact: req.user.contact,
//       role: req.user.role,
//       isActive: req.user.isActive,
//       lastLogin: req.user.lastLogin,
//     }
//   });
// });

export default router;