import "dotenv/config";
import { connectDB } from "./db.js";
import { Studio } from "../models/Studio.js";

const HOST = { ownerName: "StudioSpace Demo Host", ownerEmail: "host@studiospace.dev" };

const SAMPLES = [
  {
    title: "Sunlit Rooftop Cyc Wall Studio",
    category: "Photo Studio",
    hourlyRate: 45,
    securityDeposit: 100,
    maxCapacity: 12,
    location: "45 Water St, Brooklyn, NY",
    images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80"],
    amenities: ["Cyc Wall", "Lighting Kit", "Changing Room", "Free Parking", "Wi-Fi"],
    overview:
      "A bright 900 sq ft photo studio with a 16-foot cyclorama, floor-to-ceiling south-facing windows and a full Godox lighting package on a lighting rail. Includes a makeup/prep area, loading dock access and free client parking.",
    rating: 4.9,
    reviewsCount: 23,
    reviews: [
      { user: "Amara", rating: 5, comment: "The light in here is unreal. Booking process took two minutes." },
      { user: "Dan", rating: 4, comment: "Great cyc, would love more props on-site." },
    ],
    ...HOST,
  },
  {
    title: "Blackout Cinema Stage B",
    category: "Film Stage",
    hourlyRate: 120,
    securityDeposit: 350,
    maxCapacity: 40,
    location: "88 Sunset Blvd, Los Angeles, CA",
    images: ["https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80"],
    amenities: ["Green Screen", "Lighting Kit", "Soundproofing", "Elevator Access", "24/7 Access"],
    overview:
      "2,400 sq ft fully blacked-out sound stage with 400A three-phase power, 20-foot rigging grid, motorized backdrop and dedicated production office. Perfect for commercials and indie features.",
    rating: 4.8,
    reviewsCount: 17,
    reviews: [{ user: "Priya", rating: 5, comment: "Crew-friendly, power everywhere, silent HVAC." }],
    ...HOST,
  },
  {
    title: "The Listening Room Podcast Loft",
    category: "Podcast Lounge",
    hourlyRate: 35,
    securityDeposit: 50,
    maxCapacity: 6,
    location: "12 Tribeca Lofts, New York, NY",
    images: ["https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80"],
    amenities: ["Microphones", "Soundproofing", "Acoustic Panels", "Wi-Fi", "Kitchen Access"],
    overview:
      "Acoustically treated four-seat podcast suite with Shure SM7Bs, a RØDECaster Pro, video capture and warm neon-lit set dressing. Engineer available on request.",
    rating: 4.7,
    reviewsCount: 31,
    reviews: [{ user: "Marcus", rating: 5, comment: "Podcast-ready straight out of the desk." }],
    ...HOST,
  },
  {
    title: "Maplewood Tracking Suite",
    category: "Music Suite",
    hourlyRate: 55,
    securityDeposit: 100,
    maxCapacity: 8,
    location: "210 Maple Ave, Nashville, TN",
    images: ["https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80"],
    amenities: ["Instruments", "Mixing Console", "Microphones", "Acoustic Panels", "24/7 Access"],
    overview:
      "Live-room plus iso-booth tracking suite with a vintage analog desk, backline included (drum kit, Fender amps, upright piano) and a well-tuned monitoring room.",
    rating: 4.6,
    reviewsCount: 12,
    reviews: [{ user: "Leo", rating: 5, comment: "Drums sounded amazing. Backline saves hauling." }],
    ...HOST,
  },
  {
    title: "Clayworks Pottery Workshop",
    category: "Workshop",
    hourlyRate: 25,
    securityDeposit: 40,
    maxCapacity: 10,
    location: "3 Artisan Row, Portland, OR",
    images: ["https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=80"],
    amenities: ["Free Parking", "Kitchen Access", "Air Conditioning", "Wi-Fi", "Changing Room"],
    overview:
      "Ten-station ceramics workshop with two electric kilns, three wheels, slab roller and glaze library. Ventilated, sink-equipped and ideal for classes and photo-tidy craft sessions.",
    rating: 4.5,
    reviewsCount: 9,
    reviews: [{ user: "Ryan", rating: 4, comment: "Everything a teaching studio needs." }],
    ...HOST,
  },
  {
    title: "Natural Light Content Bay",
    category: "Photo Studio",
    hourlyRate: 30,
    securityDeposit: 60,
    maxCapacity: 6,
    location: "77 Creative Way, Austin, TX",
    images: ["https://images.unsplash.com/photo-1526080652727-5fbf88f9cd53?auto=format&fit=crop&w=1200&q=80"],
    amenities: ["Props & Backdrops", "Lighting Kit", "Wi-Fi", "Air Conditioning", "Elevator Access"],
    overview:
      "Compact content-creation bay tuned for UGC and product shoots: three backdrop sweeps, prop library, phone-controlled RGB lighting and a ring-lit table set.",
    rating: 4.4,
    reviewsCount: 7,
    reviews: [{ user: "Sofia", rating: 4, comment: "Perfect size for solo shoots." }],
    ...HOST,
  },
];

async function seed() {
  const seedDb = await connectDB(process.env.MONGODB_URI);
  const existing = await Studio.countDocuments();
  if (existing > 0) {
    console.log(`ℹ studios collection already has ${existing} documents — skipping seed.`);
    await seedDb.close();
    return;
  }
  await Studio.insertMany(SAMPLES);
  console.log(`✔ Seeded ${SAMPLES.length} sample studios (owner ${HOST.ownerEmail}).`);
  await seedDb.close();
}

seed().catch((err) => {
  console.error("✖ Seed failed:", err.message);
  process.exit(1);
});
