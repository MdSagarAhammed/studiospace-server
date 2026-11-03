import "dotenv/config";
import { connectDB, closeDB } from "./db.js";
import { studios } from "../models/Studio.js";

const HOST = { ownerName: "StudioSpace Demo Host", ownerEmail: "host@studiospace.dev" };

const SAMPLES = [
  {
    title: "Sunlit Rooftop Cyc Wall Studio",
    category: "Photo Studio",
    hourlyRate: 45,
    securityDeposit: 100,
    maxCapacity: 12,
    location: "45 Water St, Brooklyn, NY",
    images: [
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["Cyc Wall", "Lighting Kit", "Changing Room", "Free Parking", "Wi-Fi"],
    overview:
      "A bright 900 sq ft photo studio anchored by a 16-foot cyclorama and a gear wall worthy of a rental house: full strobe package on a rail, seamless sweeps in six colors and floor-to-ceiling south-facing windows for the natural-light purists. Makeup/prep area, loading dock and free client parking included.",
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
    images: [
      "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["Green Screen", "Lighting Kit", "Soundproofing", "Elevator Access", "24/7 Access"],
    overview:
      "2,400 sq ft of pure blackout: a 20-foot rigging grid, 400A three-phase power, motorized backdrop rails and a silent HVAC setup that never whispers into your dialogue track. Dedicated production office, gear cage and a loading bay that swallows a grip truck whole.",
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
    images: [
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["Microphones", "Soundproofing", "Acoustic Panels", "Wi-Fi", "Kitchen Access"],
    overview:
      "A four-seat podcast loft that sounds as warm as it looks: bass-trapped walls, Shure SM7Bs on booms, a RØDECaster Pro at the center table and video capture rolled in. Warm lamp-lit set dressing means you can publish straight from the session — engineer available on request.",
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
    images: [
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["Instruments", "Mixing Console", "Microphones", "Acoustic Panels", "24/7 Access"],
    overview:
      "Live room plus iso-booth built around a vintage analog desk and a backline you don't have to haul: house drum kit, Fender amps, upright piano and a curated mic locker. The control room is tuned hard, so what you mix is what your listeners hear.",
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
    images: [
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1493421419110-74f4e85ba126?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["Free Parking", "Kitchen Access", "Air Conditioning", "Wi-Fi", "Changing Room"],
    overview:
      "Ten maker stations under soft skylights: two electric kilns, three wheels, a slab roller and a glaze library worth getting lost in. Everything is ventilated, sink-equipped and designed for teaching — cleanup is painless and the front gallery loves to show student work.",
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
    images: [
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["Props & Backdrops", "Lighting Kit", "Wi-Fi", "Air Conditioning", "Elevator Access"],
    overview:
      "A compact content-creation bay tuned for UGC, product and portrait work: three backdrop sweeps, a curated prop shelf, app-controlled RGB panels and a ring-lit table set that goes from flat-lay to talking-head in one reposition. Small room, big output.",
    rating: 4.4,
    reviewsCount: 7,
    reviews: [{ user: "Sofia", rating: 4, comment: "Perfect size for solo shoots." }],
    ...HOST,
  },
];

async function seed() {
  await connectDB(process.env.MONGODB_URI);
  const existing = await studios().countDocuments({ ownerEmail: HOST.ownerEmail });
  if (existing > 0) {
    console.log(`ℹ ${existing} sample studios already exist — skipping seed (user-created listings are left untouched).`);
    await closeDB();
    return;
  }
  // Timestamp every doc and review, mirroring the previous model's defaults.
  const docs = SAMPLES.map((sample) => ({
    ...sample,
    reviews: sample.reviews?.map((review) => ({ ...review, createdAt: new Date() })) ?? [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  await studios().insertMany(docs);
  console.log(`✔ Seeded ${docs.length} sample studios (owner ${HOST.ownerEmail}).`);
  await closeDB();
}

seed().catch((err) => {
  console.error("✖ Seed failed:", err.message);
  process.exit(1);
});
