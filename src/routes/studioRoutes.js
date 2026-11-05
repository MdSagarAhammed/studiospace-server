import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleware.js";
import {
  listStudios,
  getFeatured,
  getMine,
  getStudio,
  createStudio,
  updateStudio,
  deleteStudio,
} from "../controllers/studioController.js";

const router = Router();

router.get("/", listStudios);
router.get("/featured", getFeatured);
router.get("/mine", requireAuth, getMine); 
router.get("/:id", getStudio);

router.post("/", requireAuth, createStudio);
router.put("/:id", requireAuth, updateStudio);
router.patch("/:id", requireAuth, updateStudio);
router.delete("/:id", requireAuth, deleteStudio);

export default router;
