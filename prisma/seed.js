const { MongoClient } = require("mongodb");
const dns = require("dns");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

// Load .env file
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

const MONGO_URI = process.env.DATABASE_URL;

const FALLBACK_RESOLVERS = ["8.8.8.8", "1.1.1.1"];
const DNS_TRANSPORT_ERRORS = new Set([
  "ECONNREFUSED",
  "ETIMEDOUT",
  "EAI_AGAIN",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "ESERVFAIL",
]);

function probeHostname(url) {
  const hostname = new URL(url).hostname;
  return url.startsWith("mongodb+srv://")
    ? dns.promises.resolveSrv(`_mongodb._tcp.${hostname}`)
    : dns.promises.resolve4(hostname);
}

async function ensureDnsResolves(url) {
  try {
    await probeHostname(url);
    return;
  } catch (error) {
    if (!DNS_TRANSPORT_ERRORS.has(error.code)) return;
  }
  const originalServers = dns.getServers();
  for (const server of FALLBACK_RESOLVERS) {
    try {
      dns.setServers([server]);
      await probeHostname(url);
      return;
    } catch {
      // try the next resolver
    }
  }
  dns.setServers(originalServers);
}

const COLLECTIONS = ["users", "products", "auctions", "bids", "payments", "notifications", "watchlists"];

const now = () => new Date();

function createUser(id, name, email, role, password, extra = {}) {
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128&bold=true`;
  return {
    id,
    name,
    email,
    password,
    role,
    avatar: avatarUrl,
    banned: false,
    ...extra,
    createdAt: now(),
    updatedAt: now(),
  };
}

function createProduct(id, title, description, image, category, sellerId) {
  return {
    id,
    title,
    description,
    image,
    category,
    sellerId,
    createdAt: now(),
    updatedAt: now(),
  };
}

function createAuction(id, productId, startPrice, currentPrice, startTime, endTime, status) {
  return {
    id,
    productId,
    startPrice,
    currentPrice,
    startTime,
    endTime,
    status,
    createdAt: now(),
    updatedAt: now(),
  };
}

function createBid(id, amount, userId, auctionId) {
  return { id, amount, userId, auctionId, createdAt: now() };
}

function createNotification(id, message, userId) {
  return { id, message, userId, read: false, createdAt: now() };
}

function databaseName(url) {
  try {
    const name = decodeURIComponent(new URL(url).pathname.replace(/^\//, ""));
    return name || "auction_db";
  } catch {
    return "auction_db";
  }
}

async function main() {
  if (!MONGO_URI) {
    throw new Error("DATABASE_URL is not set");
  }

  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  await ensureDnsResolves(MONGO_URI);

  const password = await bcrypt.hash("123456", 10);

  const users = [
    createUser("u-admin", "Admin", "admin@gmail.com", "ADMIN", password),
    createUser("u-seller", "Seller", "seller@gmail.com", "SELLER", password),
    createUser("u-bidder", "Bidder", "bidder@gmail.com", "BIDDER", password),
  ];

  for (let i = 1; i <= 10; i++) {
    users.push(
      createUser(`u-admin-${i}`, `Admin ${i}`, `admin${i}@gmail.com`, "ADMIN", password)
    );
  }

  const products = [
    createProduct(
      "p-watch",
      "Luxury Watch",
      "Premium Swiss-made automatic watch with sapphire crystal. Certified authentic with 5-year warranty.",
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80",
      "Watches",
      "u-seller"
    ),
    createProduct(
      "p-ring",
      "Vintage Diamond Ring",
      "18K gold vintage diamond ring from the 1920s. Features a 2.5-carat center diamond.",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80",
      "Jewelry",
      "u-seller"
    ),
    createProduct(
      "p-painting",
      "Classic Oil Painting",
      "Original oil painting by renowned artist. Fully authenticated with certificate of provenance.",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80",
      "Art",
      "u-seller"
    ),
  ];

  const auctions = [
    createAuction(
      "a-watch",
      "p-watch",
      500,
      750,
      now(),
      new Date(Date.now() + 86400000 * 3),
      "ACTIVE"
    ),
    createAuction(
      "a-ring",
      "p-ring",
      15000,
      16500,
      now(),
      new Date(Date.now() + 86400000 * 5),
      "ACTIVE"
    ),
    createAuction(
      "a-painting",
      "p-painting",
      8000,
      9500,
      new Date(Date.now() + 86400000),
      new Date(Date.now() + 86400000 * 7),
      "UPCOMING"
    ),
  ];

  const bids = [
    createBid("b-1", 750, "u-bidder", "a-watch"),
    createBid("b-2", 16500, "u-bidder", "a-ring"),
  ];

  const notifications = [
    createNotification("n-1", "Welcome to AuctionPro! Start exploring auctions.", "u-bidder"),
    createNotification("n-2", "Your auction 'Luxury Watch' is now live!", "u-seller"),
    createNotification("n-3", "New bid of $750 placed on Luxury Watch.", "u-seller"),
    createNotification("n-4", "Your bid on Vintage Diamond Ring was outbid!", "u-bidder"),
    createNotification("n-5", "Payment of $750 for Luxury Watch confirmed.", "u-bidder"),
    createNotification("n-6", "Auction 'Classic Oil Painting' is now upcoming.", "u-seller"),
  ];

  const payments = [
    {
      id: "pay-1",
      amount: 750,
      status: "SUCCESS",
      method: "card",
      userId: "u-bidder",
      auctionId: "a-watch",
      createdAt: now(),
    },
    {
      id: "pay-2",
      amount: 16500,
      status: "PENDING",
      method: "card",
      userId: "u-bidder",
      auctionId: "a-ring",
      createdAt: now(),
    },
  ];

  const watchlists = [
    {
      id: "w-1",
      userId: "u-bidder",
      auctionId: "a-painting",
      createdAt: now(),
    },
    {
      id: "w-2",
      userId: "u-admin",
      auctionId: "a-watch",
      createdAt: now(),
    },
  ];

  const db = {
    users,
    products,
    auctions,
    bids,
    payments,
    notifications,
    watchlists,
  };

  const dbName = databaseName(MONGO_URI);
  console.log("Connecting to database:", dbName);

  const client = new MongoClient(MONGO_URI);
  await client.connect();
  try {
    const database = client.db(dbName);
    for (const name of COLLECTIONS) {
      await database.collection(name).deleteMany({});
      if (db[name].length > 0) {
        await database.collection(name).insertMany(db[name]);
      }
    }
  } finally {
    await client.close();
  }

  console.log("Database seeded successfully into MongoDB!");
  console.log("---");
  console.log("Admin: admin@gmail.com / 123456");
  console.log("Seller: seller@gmail.com / 123456");
  console.log("Bidder: bidder@gmail.com / 123456");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
