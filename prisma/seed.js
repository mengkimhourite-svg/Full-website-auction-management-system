const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@gmail.com",
      password,
      role: "ADMIN",
    },
  });

  const seller = await prisma.user.upsert({
    where: { email: "seller@gmail.com" },
    update: {},
    create: {
      name: "Seller",
      email: "seller@gmail.com",
      password,
      role: "SELLER",
    },
  });

  const bidder = await prisma.user.upsert({
    where: { email: "bidder@gmail.com" },
    update: {},
    create: {
      name: "Bidder",
      email: "bidder@gmail.com",
      password,
      role: "BIDDER",
    },
  });

  const product1 = await prisma.product.upsert({
    where: { id: "prod-1" },
    update: {},
    create: {
      id: "prod-1",
      title: "Luxury Watch",
      description: "Premium Swiss-made automatic watch with sapphire crystal. Certified authentic with 5-year warranty.",
      image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80",
      category: "Watches",
      sellerId: seller.id,
    },
  });

  const product2 = await prisma.product.upsert({
    where: { id: "prod-2" },
    update: {},
    create: {
      id: "prod-2",
      title: "Vintage Diamond Ring",
      description: "18K gold vintage diamond ring from the 1920s. Features a 2.5-carat center diamond.",
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80",
      category: "Jewelry",
      sellerId: seller.id,
    },
  });

  const product3 = await prisma.product.upsert({
    where: { id: "prod-3" },
    update: {},
    create: {
      id: "prod-3",
      title: "Classic Oil Painting",
      description: "Original oil painting by renowned artist. Fully authenticated with certificate of provenance.",
      image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80",
      category: "Art",
      sellerId: seller.id,
    },
  });

  await prisma.auction.upsert({
    where: { id: "auc-1" },
    update: {},
    create: {
      id: "auc-1",
      productId: product1.id,
      startPrice: 500,
      currentPrice: 750,
      startTime: new Date(),
      endTime: new Date(Date.now() + 86400000 * 3),
      status: "ACTIVE",
    },
  });

  await prisma.auction.upsert({
    where: { id: "auc-2" },
    update: {},
    create: {
      id: "auc-2",
      productId: product2.id,
      startPrice: 15000,
      currentPrice: 16500,
      startTime: new Date(),
      endTime: new Date(Date.now() + 86400000 * 5),
      status: "ACTIVE",
    },
  });

  await prisma.auction.upsert({
    where: { id: "auc-3" },
    update: {},
    create: {
      id: "auc-3",
      productId: product3.id,
      startPrice: 8000,
      currentPrice: 9500,
      startTime: new Date(Date.now() + 86400000),
      endTime: new Date(Date.now() + 86400000 * 7),
      status: "UPCOMING",
    },
  });

  await prisma.bid.upsert({
    where: { id: "bid-1" },
    update: {},
    create: {
      id: "bid-1",
      amount: 750,
      userId: bidder.id,
      auctionId: "auc-1",
    },
  });

  await prisma.bid.upsert({
    where: { id: "bid-2" },
    update: {},
    create: {
      id: "bid-2",
      amount: 16500,
      userId: bidder.id,
      auctionId: "auc-2",
    },
  });

  await prisma.notification.upsert({
    where: { id: "notif-1" },
    update: {},
    create: {
      id: "notif-1",
      message: "Welcome to AuctionPro! Start exploring auctions.",
      userId: bidder.id,
    },
  });

  await prisma.notification.upsert({
    where: { id: "notif-2" },
    update: {},
    create: {
      id: "notif-2",
      message: "Your auction 'Luxury Watch' is now live!",
      userId: seller.id,
    },
  });

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
