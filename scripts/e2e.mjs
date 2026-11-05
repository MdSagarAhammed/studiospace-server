const BASE = "http://localhost:5010";
const ORIGIN = { Origin: "http://localhost:3000" };
let cookie = "";

async function call(method, path, body, expect = 200) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...ORIGIN,
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    const [pair, ...attrs] = setCookie.split("; ");
    const jarEntries = new Map(cookie ? cookie.split("; ").map((c) => c.split("=")) : []);
    if (attrs.some((a) => a.toLowerCase() === "expired")) jarEntries.delete(pair.split("=")[0]);
    else jarEntries.set(pair.split("=")[0], pair.split("=").slice(1).join("="));
    cookie = [...jarEntries].map(([k, v]) => `${k}=${v}`).join("; ");
  }
  let json = null;
  try { json = await res.json(); } catch {}
  const ok = res.status === expect;
  console.log(`${ok ? "✔" : "✖"} [${res.status}] ${method} ${path}`);
  if (!ok) { console.log("   →", JSON.stringify(json)); process.exit(1); }
  return json;
}

const rand = Math.random().toString(36).slice(2, 8);
const email = `test-${rand}@studios.dev`;

const reg = await call("POST", "/api/auth/sign-up/email", {
  name: "Test Host", email, password: "Test123",
  image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
}, 200);
console.log("   user:", reg.user?.id);

const s = await call("GET", "/api/auth/get-session");
console.log("   session user:", s.user?.email);


const created = await call("POST", "/api/studios", {
  title: "E2E Test Loft", category: "Photo Studio", hourlyRate: 40,
  securityDeposit: 50, maxCapacity: 5, location: "1 Test St, NYC",
  images: ["https://i.ibb.co/e2e.jpg"], amenities: ["Wi-Fi", "Cyc Wall"],
  overview: "End-to-end test space.",
}, 201);
const sid = created.data._id;
console.log("   owner set from session:", created.data.ownerEmail === email);

const mine = await call("GET", "/api/studios/mine");
console.log("   mine count:", mine.data.length);

const upd = await call("PUT", `/api/studios/${sid}`, { title: "E2E Loft v2", hourlyRate: 55 });
console.log("   updated:", upd.data.title, "$" + upd.data.hourlyRate);

const b = await call("POST", "/api/bookings", {
  studioId: sid, date: "2026-11-05", startTime: "14:00", hours: 3,
}, 201);
console.log("   booking:", b.data.status, "total $" + b.data.totalPrice, "(expect $165)");
const bid = b.data._id;

await call("POST", "/api/bookings", {
  studioId: sid, date: "2026-11-05", startTime: "15:00", hours: 1,
}, 409);

const mine_b = await call("GET", "/api/bookings/mine");
console.log("   bookings/mine populated studio:", mine_b.data[0].studio?.title);
const c1 = await call("PATCH", `/api/bookings/${bid}/cancel`);
console.log("   cancelled →", c1.data.status);
await call("PATCH", `/api/bookings/${bid}/cancel`, undefined, 400); 
console.log("   double-cancel rejected ✔");

await call("DELETE", `/api/studios/${sid}`);
await call("GET", `/api/studios/${sid}`, undefined, 404);
console.log("   studio deleted ✔");
console.log("\n🎉 All e2e checks passed");
process.exit(0);
