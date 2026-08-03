const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function upsertUser(email, data) {
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, ...data },
  });
}

async function upsertProduct(sellerId, data) {
  const existing = await prisma.product.findFirst({ where: { title: data.title } });
  if (existing) return existing;
  return prisma.product.create({ data: { ...data, sellerId } });
}

async function main() {
  const password = await bcrypt.hash("123456", 10);

  const admin = await upsertUser("admin@gmail.com", {
    name: "Admin",
    password,
    role: "ADMIN",
  });

  const seller = await upsertUser("seller@gmail.com", {
    name: "Seller",
    password,
    role: "SELLER",
  });

  const bidder = await upsertUser("bidder@gmail.com", {
    name: "Bidder",
    password,
    role: "BIDDER",
  });

  const admins = [
    { name: "Admin 1", email: "admin1@gmail.com" },
    { name: "Admin 2", email: "admin2@gmail.com" },
    { name: "Admin 3", email: "admin3@gmail.com" },
    { name: "Admin 4", email: "admin4@gmail.com" },
    { name: "Admin 5", email: "admin5@gmail.com" },
    { name: "Admin 6", email: "admin6@gmail.com" },
    { name: "Admin 7", email: "admin7@gmail.com" },
    { name: "Admin 8", email: "admin8@gmail.com" },
    { name: "Admin 9", email: "admin9@gmail.com" },
    { name: "Admin 10", email: "admin10@gmail.com" },
  ];

  for (const a of admins) {
    await upsertUser(a.email, {
      name: a.name,
      password,
      role: "ADMIN",
    });
  }

  const product1 = await upsertProduct(seller.id, {
    title: "Luxury Watch",
    description: "Premium Swiss-made automatic watch with sapphire crystal. Certified authentic with 5-year warranty.",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80",
    category: "Watches",
  });

  const product2 = await upsertProduct(seller.id, {
    title: "Vintage Diamond Ring",
    description: "18K gold vintage diamond ring from the 1920s. Features a 2.5-carat center diamond.",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80",
    category: "Jewelry",
  });

  const product3 = await upsertProduct(seller.id, {
    title: "Classic Oil Painting",
    description: "Original oil painting by renowned artist. Fully authenticated with certificate of provenance.",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80",
    category: "Art",
  });

  async function upsertAuction(productId, data) {
    const existing = await prisma.auction.findFirst({ where: { productId } });
    if (existing) return existing;
    return prisma.auction.create({ data: { productId, ...data } });
  }

  const auction1 = await upsertAuction(product1.id, {
    startPrice: 500,
    currentPrice: 750,
    startTime: new Date(),
    endTime: new Date(Date.now() + 86400000 * 3),
    status: "ACTIVE",
  });

  const auction2 = await upsertAuction(product2.id, {
    startPrice: 15000,
    currentPrice: 16500,
    startTime: new Date(),
    endTime: new Date(Date.now() + 86400000 * 5),
    status: "ACTIVE",
  });

  const auction3 = await upsertAuction(product3.id, {
    startPrice: 8000,
    currentPrice: 9500,
    startTime: new Date(Date.now() + 86400000),
    endTime: new Date(Date.now() + 86400000 * 7),
    status: "UPCOMING",
  });

  const existingBid = await prisma.bid.findFirst({
    where: { auctionId: auction1.id, userId: bidder.id },
  });
  if (!existingBid) {
    await prisma.bid.create({
      data: { amount: 750, userId: bidder.id, auctionId: auction1.id },
    });
    await prisma.bid.create({
      data: { amount: 16500, userId: bidder.id, auctionId: auction2.id },
    });
  }

  const existingNotif = await prisma.notification.findFirst({
    where: { userId: bidder.id },
  });
  if (!existingNotif) {
    await prisma.notification.create({
      data: { message: "Welcome to AuctionPro! Start exploring auctions.", userId: bidder.id },
    });
    await prisma.notification.create({
      data: { message: "Your auction 'Luxury Watch' is now live!", userId: seller.id },
    });
  }

  console.log("Database seeded successfully!");
  console.log("---");
  console.log("Admin: admin@gmail.com / 123456");
  console.log("Seller: seller@gmail.com / 123456");
  console.log("Bidder: bidder@gmail.com / 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
