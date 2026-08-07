const { MongoClient } = require("mongodb");
const dns = require("dns");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

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
  "ECONNREFUSED", "ETIMEDOUT", "EAI_AGAIN", "EHOSTUNREACH", "ENETUNREACH", "ESERVFAIL",
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
    } catch {}
  }
  dns.setServers(originalServers);
}

const COLLECTIONS = ["users", "products", "auctions", "bids", "payments", "notifications", "watchlists"];

const now = () => new Date();

function createUser(id, name, email, role, password, extra = {}) {
  return {
    id, name, email, password, role,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128&bold=true`,
    banned: false, ...extra, createdAt: now(), updatedAt: now(),
  };
}

function createProduct(id, title, description, image, category, sellerId) {
  return { id, title, description, image, category, sellerId, createdAt: now(), updatedAt: now() };
}

function createAuction(id, productId, startPrice, currentPrice, startTime, endTime, status) {
  return { id, productId, startPrice, currentPrice, startTime, endTime, status, createdAt: now(), updatedAt: now() };
}

function createBid(id, amount, userId, auctionId) {
  return { id, amount, userId, auctionId, createdAt: now() };
}

function createNotification(id, message, userId, read = false) {
  return { id, message, userId, read, createdAt: now() };
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
  if (!MONGO_URI) throw new Error("DATABASE_URL is not set");

  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  await ensureDnsResolves(MONGO_URI);

  const password = await bcrypt.hash("123456", 10);

  const users = [
    createUser("u-admin", "Admin", "admin@gmail.com", "ADMIN", password),
    createUser("u-seller", "Premium Seller", "seller@gmail.com", "SELLER", password),
    createUser("u-seller2", "Elite Seller", "seller2@gmail.com", "SELLER", password),
    createUser("u-bidder", "John Bidder", "bidder@gmail.com", "BIDDER", password),
    createUser("u-bidder2", "Jane Collector", "bidder2@gmail.com", "BIDDER", password),
    createUser("u-bidder3", "Mike Hunter", "bidder3@gmail.com", "BIDDER", password),
  ];

  const products = [
    // Watches
    createProduct("p-watch1", "Rolex Submariner Date 126610LN",
      "Brand new Rolex Submariner Date with black ceramic bezel. Automatic movement, 41mm case. Complete with box and papers. Authenticity guaranteed.",
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80", "Watches", "u-seller"),
    createProduct("p-watch2", "Omega Speedmaster Moonwatch",
      "The legendary Omega Speedmaster Professional - the first watch worn on the Moon. H hesalite crystal, manual-winding movement. Full set with international warranty.",
      "https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=600&q=80", "Watches", "u-seller"),
    createProduct("p-watch3", "Patek Philippe Nautilus 5711",
      "The iconic Patek Philippe Nautilus in stainless steel. Blue gradient dial, 40mm case. One of the most sought-after luxury watches in the world.",
      "https://images.unsplash.com/photo-1526045431048-f857369baa09?w=600&q=80", "Watches", "u-seller2"),

    // Jewelry
    createProduct("p-ring1", "Vintage Diamond Engagement Ring",
      "18K gold vintage diamond ring from the 1920s Art Deco era. Features a stunning 2.5-carat center diamond with VS1 clarity. GIA certified.",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80", "Jewelry", "u-seller"),
    createProduct("p-necklace1", "South Sea Pearl Necklace",
      "Exquisite strand of 18 premium South Sea pearls with 18K white gold clasp. Each pearl is 10-12mm with excellent luster.",
      "https://images.unsplash.com/photo-1515562141589-67f0d569b6c4?w=600&q=80", "Jewelry", "u-seller2"),

    // Art
    createProduct("p-painting1", "Abstract Contemporary Oil Painting",
      "Original oil painting by emerging artist. Bold colors and dynamic composition. Gallery wrapped canvas, 36x48 inches. Signed and dated.",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80", "Art", "u-seller"),
    createProduct("p-painting2", "Japanese Ink Wash Landscape",
      "Traditional Japanese sumi-e ink wash painting on rice paper. Serene mountain landscape with cherry blossoms. Framed in bamboo.",
      "https://images.unsplash.com/photo-1580136579312-94651dfd596c?w=600&q=80", "Art", "u-seller"),

    // Cars
    createProduct("p-car1", "1967 Ford Mustang Fastback",
      "Fully restored 1967 Ford Mustang GT Fastback in Highland Green. 289 V8 engine, 4-speed manual transmission. Show quality restoration.",
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80", "Cars", "u-seller"),
    createProduct("p-car2", "2020 Porsche 911 Turbo S",
      "Low mileage 2020 Porsche 911 Turbo S in GT Silver Metallic. 640hp twin-turbo flat-6, PDK transmission. Fully loaded with all options.",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80", "Cars", "u-seller2"),

    // Wine
    createProduct("p-wine1", "Chateau Margaux 2015 (6 Bottle Case)",
      "Six bottles of Chateau Margaux 2015 Premier Grand Cru Classe. Stored in perfect conditions. Rating: 98/100 by Robert Parker.",
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80", "Wine", "u-seller"),
    createProduct("p-wine2", "Opus One 2018 Vintage",
      "Two bottles of Opus One 2018 from Napa Valley. A masterful blend of Cabernet Sauvignon and Merlot. Cellar condition.",
      "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=600&q=80", "Wine", "u-seller"),

    // Electronics
    createProduct("p-tech1", "Vintage Rolex Submariner Service Kit",
      "Original Rolex service toolkit from the 1970s. Includes case opener, crown winder, and adjustment tools. Rare collector's item.",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80", "Collectibles", "u-seller"),

    // Antiques
    createProduct("p-antique1", "Ming Dynasty Ceramic Vase",
      "Authentic Ming Dynasty blue and white porcelain vase. Expertly restored with certificate of authenticity. Museum quality piece.",
      "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600&q=80", "Antiques", "u-seller2"),
  ];

  const t = Date.now();
  const HOUR = 3600000;
  const DAY = 86400000;

  const auctions = [
    // Active auctions (ending soon)
    createAuction("a-watch1", "p-watch1", 12000, 15750,
      new Date(t - DAY * 2), new Date(t + HOUR * 6), "ACTIVE"),
    createAuction("a-ring1", "p-ring1", 8000, 12200,
      new Date(t - DAY * 3), new Date(t + HOUR * 12), "ACTIVE"),
    createAuction("a-painting1", "p-painting1", 2500, 4100,
      new Date(t - DAY), new Date(t + DAY * 2), "ACTIVE"),
    createAuction("a-wine1", "p-wine1", 3000, 4500,
      new Date(t - DAY * 4), new Date(t + HOUR * 18), "ACTIVE"),

    // Active auctions (ending in days)
    createAuction("a-car1", "p-car1", 50000, 62000,
      new Date(t - DAY * 5), new Date(t + DAY * 3), "ACTIVE"),
    createAuction("a-watch2", "p-watch2", 5000, 7200,
      new Date(t - DAY * 2), new Date(t + DAY * 4), "ACTIVE"),
    createAuction("a-necklace1", "p-necklace1", 6000, 8500,
      new Date(t - DAY * 1), new Date(t + DAY * 5), "ACTIVE"),

    // Upcoming auctions
    createAuction("a-car2", "p-car2", 150000, 150000,
      new Date(t + DAY), new Date(t + DAY * 7), "UPCOMING"),
    createAuction("a-painting2", "p-painting2", 1500, 1500,
      new Date(t + DAY * 2), new Date(t + DAY * 9), "UPCOMING"),
    createAuction("a-tech1", "p-tech1", 500, 500,
      new Date(t + DAY * 3), new Date(t + DAY * 10), "UPCOMING"),

    // Ended auctions
    createAuction("a-watch3", "p-watch3", 100000, 135000,
      new Date(t - DAY * 14), new Date(t - DAY * 1), "ENDED"),
    createAuction("a-wine2", "p-wine2", 1800, 2800,
      new Date(t - DAY * 10), new Date(t - DAY * 3), "ENDED"),
    createAuction("a-antique1", "p-antique1", 20000, 28500,
      new Date(t - DAY * 7), new Date(t - DAY * 2), "ENDED"),
  ];

  const bids = [
    // Watch 1 bids
    createBid("b-1", 13000, "u-bidder", "a-watch1"),
    createBid("b-2", 14500, "u-bidder2", "a-watch1"),
    createBid("b-3", 15750, "u-bidder3", "a-watch1"),

    // Ring 1 bids
    createBid("b-4", 9000, "u-bidder", "a-ring1"),
    createBid("b-5", 10500, "u-bidder3", "a-ring1"),
    createBid("b-6", 12200, "u-bidder2", "a-ring1"),

    // Painting 1 bids
    createBid("b-7", 3000, "u-bidder", "a-painting1"),
    createBid("b-8", 3500, "u-bidder3", "a-painting1"),
    createBid("b-9", 4100, "u-bidder2", "a-painting1"),

    // Wine 1 bids
    createBid("b-10", 3500, "u-bidder2", "a-wine1"),
    createBid("b-11", 4500, "u-bidder", "a-wine1"),

    // Car 1 bids
    createBid("b-12", 55000, "u-bidder2", "a-car1"),
    createBid("b-13", 58000, "u-bidder", "a-car1"),
    createBid("b-14", 62000, "u-bidder3", "a-car1"),

    // Watch 2 bids
    createBid("b-15", 6000, "u-bidder2", "a-watch2"),
    createBid("b-16", 7200, "u-bidder", "a-watch2"),

    // Necklace bids
    createBid("b-17", 7000, "u-bidder3", "a-necklace1"),
    createBid("b-18", 8500, "u-bidder", "a-necklace1"),

    // Ended auction bids
    createBid("b-19", 120000, "u-bidder", "a-watch3"),
    createBid("b-20", 135000, "u-bidder2", "a-watch3"),
    createBid("b-21", 2200, "u-bidder3", "a-wine2"),
    createBid("b-22", 2800, "u-bidder", "a-wine2"),
    createBid("b-23", 25000, "u-bidder", "a-antique1"),
    createBid("b-24", 28500, "u-bidder2", "a-antique1"),
  ];

  const notifications = [
    // Bidder notifications
    createNotification("n-1", "Welcome to AuctionPro! Start exploring auctions.", "u-bidder", true),
    createNotification("n-2", "You won the auction \"Patek Philippe Nautilus 5711\"! Complete your payment to claim it.", "u-bidder2", false),
    createNotification("n-3", "Your bid of $15,750 on \"Rolex Submariner Date 126610LN\" is the current highest.", "u-bidder3", false),
    createNotification("n-4", "You have been outbid on \"Vintage Diamond Engagement Ring\". New highest bid: $12,200", "u-bidder", false),
    createNotification("n-5", "Payment of $135,000 for \"Patek Philippe Nautilus 5711\" confirmed.", "u-bidder2", true),
    createNotification("n-6", "Auction \"Rolex Submariner Date 126610LN\" ends in 6 hours. Don't miss it!", "u-bidder", false),

    // Seller notifications
    createNotification("n-7", "Your auction \"Rolex Submariner Date 126610LN\" has a new bid of $15,750.", "u-seller", false),
    createNotification("n-8", "Your auction \"Vintage Diamond Engagement Ring\" has a new bid of $12,200.", "u-seller", false),
    createNotification("n-9", "Your auction \"Patek Philippe Nautilus 5711\" has ended. Winner: Jane Collector.", "u-seller2", true),
    createNotification("n-10", "Payment of $28,500 received from Jane Collector for \"Ming Dynasty Ceramic Vase\".", "u-seller2", true),
    createNotification("n-11", "Welcome to AuctionPro as a seller! Create your first auction.", "u-seller2", true),

    // Admin notifications
    createNotification("n-12", "New user registered: Mike Hunter (BIDDER).", "u-admin", true),
    createNotification("n-13", "Payment of $135,000 received from Jane Collector for \"Patek Philippe Nautilus 5711\".", "u-admin", true),
    createNotification("n-14", "Payment of $2,800 received from John Bidder for \"Opus One 2018 Vintage\".", "u-admin", true),
    createNotification("n-15", "Contact message from Alex: Interested in bulk purchasing watches.", "u-admin", false),
  ];

  const payments = [
    // Ended auction payments
    {
      id: "pay-1", amount: 135000, status: "SUCCESS", method: "card",
      userId: "u-bidder2", auctionId: "a-watch3", createdAt: new Date(t - DAY),
    },
    {
      id: "pay-2", amount: 2800, status: "SUCCESS", method: "card",
      userId: "u-bidder", auctionId: "a-wine2", createdAt: new Date(t - DAY * 2),
    },
    {
      id: "pay-3", amount: 28500, status: "SUCCESS", method: "bank_transfer",
      userId: "u-bidder2", auctionId: "a-antique1", createdAt: new Date(t - DAY * 1),
    },
    // Pending payment
    {
      id: "pay-4", amount: 28500, status: "PENDING", method: "card",
      userId: "u-bidder2", auctionId: "a-antique1", createdAt: new Date(t - DAY * 1),
    },
  ];

  const watchlists = [
    { id: "w-1", userId: "u-bidder", auctionId: "a-car2", createdAt: now() },
    { id: "w-2", userId: "u-bidder", auctionId: "a-watch2", createdAt: now() },
    { id: "w-3", userId: "u-bidder2", auctionId: "a-painting1", createdAt: now() },
    { id: "w-4", userId: "u-bidder3", auctionId: "a-watch1", createdAt: now() },
    { id: "w-5", userId: "u-bidder3", auctionId: "a-car1", createdAt: now() },
    { id: "w-6", userId: "u-admin", auctionId: "a-watch1", createdAt: now() },
    { id: "w-7", userId: "u-bidder", auctionId: "a-necklace1", createdAt: now() },
  ];

  const db = { users, products, auctions, bids, payments, notifications, watchlists };

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
      console.log(`  Seeded ${db[name].length} documents into ${name}`);
    }
  } finally {
    await client.close();
  }

  console.log("\nDatabase seeded successfully!");
  console.log("---");
  console.log("Test accounts (password: 123456):");
  console.log("  Admin:  admin@gmail.com");
  console.log("  Seller: seller@gmail.com / seller2@gmail.com");
  console.log("  Bidder: bidder@gmail.com / bidder2@gmail.com / bidder3@gmail.com");
  console.log("---");
  console.log(`Seeded ${users.length} users, ${products.length} products, ${auctions.length} auctions, ${bids.length} bids, ${payments.length} payments, ${notifications.length} notifications, ${watchlists.length} watchlists`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
