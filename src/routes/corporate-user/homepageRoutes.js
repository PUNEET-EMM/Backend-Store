import express from "express";
import { getHomepage } from "../../controllers/crm/homepageController.js";

const router = express.Router();

router.get("/homepage", getHomepage);

export default router;
