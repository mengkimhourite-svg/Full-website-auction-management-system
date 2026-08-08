import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100),
  role: z.enum(["ADMIN", "SELLER", "BIDDER"]).optional().default("BIDDER"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters")
    .max(100),
});

export const auctionSchema = z.object({
  productTitle: z.string().min(1, "Product title is required").max(200),
  productDescription: z.string().max(2000).optional().default(""),
  productImage: z.string().url("Invalid image URL").optional().nullable(),
  category: z.string().max(100).optional().default("General"),
  startPrice: z.number().min(0, "Start price must be non-negative"),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime("Invalid end time"),
});

export const bidSchema = z.object({
  amount: z.number().positive("Bid amount must be positive"),
});

export const paymentSchema = z.object({
  auctionId: z.string().min(1, "Auction ID is required"),
  method: z
    .enum(["card", "paypal", "bank_transfer"])
    .optional()
    .default("card"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100),
});

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  subject: z.string().max(200).optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(["ADMIN", "SELLER", "BIDDER"]).optional(),
  avatar: z.string().nullable().optional(),
});

export const banUserSchema = z.object({
  banned: z.boolean().optional(),
});

export const watchlistSchema = z.object({
  auctionId: z.string().min(1, "Auction ID is required"),
});

export const notificationSchema = z.object({
  read: z.boolean().optional().default(true),
});
