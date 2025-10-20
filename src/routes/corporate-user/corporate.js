import express from 'express';
import { validateRegistration } from '../../validations/corporateValidation.js';
import { registerCorporate } from '../../controllers/corporatecontroller.js';

const router = express.Router();



router.post("/register", validateRegistration, registerCorporate);

export default router;