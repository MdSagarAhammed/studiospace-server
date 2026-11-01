import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    studio: { type: mongoose.Schema.Types.ObjectId, ref: "Studio", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    bookerName: { type: String, required: true },
    bookerEmail: { type: String, required: true, lowercase: true },
    date: { type: String, required: true }, // YYYY-MM-DD (frontend contract)
    startTime: { type: String, default: "10:00" },
    hours: { type: Number, required: true, min: 1 },
    // Snapshot of pricing at booking time — stays stable if the studio rate changes
    hourlyRate: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true, collection: "bookings" }
);

bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ studio: 1 });

export const Booking = mongoose.model("Booking", bookingSchema);
