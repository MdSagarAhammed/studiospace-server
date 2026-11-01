import mongoose from "mongoose";

const studioSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["Photo Studio", "Film Stage", "Podcast Lounge", "Music Suite", "Workshop"],
    },
    hourlyRate: { type: Number, required: true, min: 0 },
    securityDeposit: { type: Number, default: 0, min: 0 },
    maxCapacity: { type: Number, required: true, min: 1 },
    location: { type: String, required: true, trim: true },
    images: { type: [String], default: [] },
    amenities: { type: [String], default: [] },
    overview: { type: String, required: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    ownerName: { type: String, required: true },
    ownerEmail: { type: String, required: true, lowercase: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0 },
    reviews: [
      {
        user: String,
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, collection: "studios" }
);

studioSchema.index({ category: 1 });
studioSchema.index({ ownerEmail: 1 });
studioSchema.index({ createdAt: -1 });

export const Studio = mongoose.model("Studio", studioSchema);
