import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleware.js";
import {
  createBooking,
  getMyBookings,
  cancelBooking,
} from "../controllers/bookingController.js";

const router = Router();
router.use(requireAuth); 

router.get("/mine", getMyBookings); 
router.post("/", createBooking);
router.patch("/:id/cancel", cancelBooking);

export default router;
