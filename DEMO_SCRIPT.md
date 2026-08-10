# AuctionPro - Demo Script

## Overview
This script covers a full walkthrough of the AuctionPro online auction platform, demonstrating all features for buyers, sellers, and administrators.

---

## Part 1: Introduction & Homepage (2 minutes)

### Scene: Open browser to http://localhost:3000

**Narrator:**
"Welcome to AuctionPro, a full-stack online auction platform built with Next.js, TypeScript, MongoDB, and Tailwind CSS. Let me walk you through everything this platform can do."

**Actions:**
1. Show the hero section with the animated banner
2. Scroll down to the Trust Bar (Secure Escrow, Authenticity Guaranteed, Real-time Bidding, 50,000+ Users)
3. Scroll to the Categories section - hover over each category card (Watches, Jewelry, Art, Cars, Wine, Collectibles)
4. Scroll to Featured Auctions - show the live auction cards with countdown timers and bid counts
5. Scroll to "How It Works" - three steps: Create Account, Place Your Bid, Win & Collect
6. Scroll to Testimonials - show user reviews
7. Scroll to the CTA section

**Narrator:**
"As you can see, the homepage showcases live auctions, categories, and guides new users through the platform. The design uses a premium Navy Blue and Gold color scheme with smooth animations."

---

## Part 2: User Registration (2 minutes)

### Scene: Click "Get Started Free" or navigate to /register

**Narrator:**
"Let's start by creating a new account. AuctionPro supports three user roles: Bidder, Seller, and Admin."

**Actions:**
1. Navigate to /register
2. Fill in the registration form:
   - Full Name: "Demo User"
   - Email: "demo@auctionpro.com"
   - Password: "demo123456"
3. Click "Create Account"
4. Verify redirect to homepage after successful registration

**Narrator:**
"Registration is simple with just three fields. The password is securely hashed with bcrypt before storage. After registration, you're automatically logged in via a JWT token stored in an httpOnly cookie."

---

## Part 3: User Login (1 minute)

### Scene: Logout and login as bidder

**Actions:**
1. Click user avatar in navbar, click "Logout"
2. Navigate to /login
3. Enter credentials:
   - Email: "bidder@gmail.com"
   - Password: "123456"
4. Click "Login"
5. Verify redirect based on role (bidder sees homepage)

**Narrator:**
"The login system validates credentials against our MongoDB database. Invalid passwords return a generic 'Invalid email or password' message for security. Banned accounts are blocked from logging in."

---

## Part 4: Browsing Auctions (3 minutes)

### Scene: Navigate to /auctions

**Narrator:**
"The auctions page shows all available items with search, filter, and sort capabilities."

**Actions:**
1. Show the search bar - type "watch" to search
2. Show the sort dropdown - sort by "Ending Soon", "Price: Low to High", "Price: High to Low"
3. Click "Filters" button - show category filter panel
4. Select "Watches" category filter
5. Show the auction grid with cards displaying:
   - Product image
   - Status badge (Active/Ended/Upcoming)
   - Countdown timer
   - Current bid price
   - Number of bids
6. Click on an auction card to view details

**Narrator:**
"Each auction card shows real-time countdown timers, current bid prices, and bid counts. The search is debounced and filters across product titles, descriptions, and categories."

---

## Part 5: Auction Detail & Bidding (4 minutes)

### Scene: View auction detail page

**Actions:**
1. Show the auction detail page with:
   - Product image (full size)
   - Status badge and category tag
   - Product title and description
   - Seller information card
   - Current bid price (large, prominent)
   - Starting price
   - Time remaining with countdown
2. Click "Add to Watchlist" button - verify it toggles
3. Scroll to "Place Your Bid" form
4. Enter a bid amount higher than current price
5. Click "Place Bid" button
6. Show success message: "Bid Placed Successfully!"
7. Scroll to Bid History section showing all previous bids

**Narrator:**
"The auction detail page provides everything a bidder needs. The Place Bid form validates that your bid is higher than the current price. Bid history shows all previous bids with bidder names and timestamps. The watchlist feature lets you save auctions for later."

---

## Part 6: Seller Dashboard (3 minutes)

### Scene: Login as seller and navigate to dashboard

**Actions:**
1. Logout and login as seller (seller@gmail.com / 123456)
2. Redirected to /seller/auctions
3. Show the seller dashboard with:
   - Sidebar navigation (Auctions, Create Auction, Creations)
   - Auction management table with status, bids, actions
4. Click "Create Auction" button
5. Fill in the create auction form:
   - Product Title: "Vintage Rolex GMT-Master"
   - Description: "Rare 1970s Rolex GMT-Master with original box and papers."
   - Category: "Watches"
   - Starting Price: "$8,000"
   - End Time: Select date 7 days from now
6. Click "Create Auction"
7. Verify auction appears in the list
8. Click "Edit" on an existing auction
9. Show the edit form with pre-filled data
10. Make a change and save

**Narrator:**
"Sellers have their own dashboard to manage auctions. They can create new auctions with product details, set starting prices, and choose end dates. The system automatically determines if an auction is ACTIVE or UPCOMING based on the start time."

---

## Part 7: Admin Dashboard (4 minutes)

### Scene: Login as admin and navigate to dashboard

**Actions:**
1. Logout and login as admin (admin@gmail.com / 123456)
2. Redirected to /admin
3. Show the admin dashboard with:
   - 8 stat cards (Total Auctions, Products, Users, Bids, Revenue, Pending Payments, Active Auctions, Notifications)
   - Revenue Overview chart (AreaChart)
   - Auction Activity chart (BarChart)
   - Recent Auctions table
4. Navigate to "Users" page - show user management table
5. Click "Ban" button on a user - verify status changes
6. Click "Edit" to change user role
7. Navigate to "Auctions" page - show all auctions management
8. Navigate to "Payments" page - show payment history
9. Navigate to "Reports" page - show monthly analytics with charts
10. Navigate to "Notifications" page - show notification management

**Narrator:**
"The admin dashboard provides a complete overview of the platform. Admins can manage users (ban/unban, change roles), monitor all auctions, view payment history, and access detailed reports with charts. The dashboard uses a dark theme with a sidebar navigation."

---

## Part 8: Notifications System (2 minutes)

### Scene: Show notifications page

**Actions:**
1. Click the notification bell icon in the navbar
2. Show the notification dropdown with unread count badge
3. Navigate to /notifications page
4. Show the full notifications list with:
   - Read/unread status
   - Message content
   - Timestamp
5. Click on a notification to mark as read
6. Click "Mark All as Read" button
7. Verify unread count updates

**Narrator:**
"The notification system keeps users informed about bids, auction endings, payments, and contact messages. Notifications are generated server-side when events occur, and users can mark them as read individually or all at once."

---

## Part 9: Profile & Settings (2 minutes)

### Scene: Navigate to profile page

**Actions:**
1. Navigate to /profile
2. Show the profile page with:
   - Avatar display
   - User information form (name, email)
   - Account settings
3. Click "Upload Avatar" - select an image file
4. Show avatar preview update
5. Click "Change Password" section
6. Enter current and new password
7. Click "Save Changes"

**Narrator:**
"Users can manage their profile including uploading an avatar (stored as base64 in the database with a 2MB limit), updating their name and email, and changing their password. The password change requires the current password for security."

---

## Part 10: Payment Flow (2 minutes)

### Scene: Complete payment for won auction

**Actions:**
1. Login as winning bidder (bidder2@gmail.com / 123456)
2. Navigate to an ended auction where the user is the winner
3. Click "Pay Now" button
4. Redirected to /checkout page
5. Show the checkout summary with:
   - Auction title
   - Winning bid amount
   - Total
6. Fill in the payment form:
   - Cardholder Name: "Jane Collector"
   - Card Number: "4242 4242 4242 4242"
   - Expiry: "12/28"
   - CVV: "123"
7. Click "Pay" button
8. Show payment success confirmation
9. Verify notification sent to user and admin

**Narrator:**
"After winning an auction, the bidder can complete payment through the checkout page. The payment form simulates a card payment (in a production environment, this would integrate with Stripe or PayPal). Both the buyer and admin receive notifications about the payment."

---

## Part 11: Contact Form (1 minute)

### Scene: Navigate to contact page

**Actions:**
1. Navigate to /contact
2. Fill in the contact form:
   - Name: "Alex Johnson"
   - Email: "alex@example.com"
   - Subject: "Bulk Purchase Inquiry"
   - Message: "I'm interested in purchasing multiple watches for my collection. Can you provide a bulk discount?"
3. Click "Send Message"
4. Show success confirmation

**Narrator:**
"The contact form sends a notification to all admin users. This ensures that customer inquiries are seen immediately without requiring email infrastructure."

---

## Part 12: Static Pages (1 minute)

### Scene: Quick tour of informational pages

**Actions:**
1. Navigate to /about - show mission statement and community section
2. Navigate to /how-it-works - show the 3-step process
3. Navigate to /faq - show frequently asked questions
4. Navigate to /categories - show all category cards
5. Navigate to /privacy - show privacy policy
6. Navigate to /terms - show terms of service
7. Navigate to /shipping - show shipping information

**Narrator:**
"AuctionPro includes all the essential static pages: About Us, How It Works, FAQ, Categories, Privacy Policy, Terms of Service, and Shipping Information. Each page uses the same premium design system with animations."

---

## Part 13: Responsive Design (1 minute)

### Scene: Show mobile view

**Actions:**
1. Resize browser to mobile width (375px)
2. Show the mobile navbar with hamburger menu
3. Show auction cards stacking vertically
4. Show forms adapting to mobile width
5. Show sidebar collapsing on mobile
6. Demonstrate touch-friendly buttons and inputs

**Narrator:**
"AuctionPro is fully responsive across all devices. The mobile experience includes a collapsible navbar, stacked card layouts, and touch-friendly interactions."

---

## Part 14: Technical Highlights (1 minute)

### Scene: Show code structure

**Actions:**
1. Briefly show the project structure in VS Code
2. Highlight key files:
   - src/lib/db.ts - Custom MongoDB ORM (777 lines)
   - src/lib/auth.ts - JWT authentication
   - src/lib/validation.ts - Zod schemas
   - src/lib/rateLimit.ts - Rate limiting
   - src/proxy.ts - Route protection
   - src/app/api/ - REST API routes
   - src/components/ - 50+ React components

**Narrator:**
"Under the hood, AuctionPro uses a custom MongoDB ORM with a Prisma-compatible API, JWT authentication with httpOnly cookies, Zod validation on all API routes, rate limiting to prevent abuse, and proxy-based route protection. The frontend uses 50+ React components organized by domain."

---

## Part 15: Closing (30 seconds)

### Scene: Return to homepage

**Actions:**
1. Navigate back to homepage
2. Show the hero section one more time
3. Scroll to the CTA section

**Narrator:**
"AuctionPro is a complete, production-ready auction platform with role-based access control, real-time bidding, payment processing, notifications, and a premium UI. Thank you for watching this demo."

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gmail.com | 123456 |
| Seller | seller@gmail.com | 123456 |
| Seller | seller2@gmail.com | 123456 |
| Bidder | bidder@gmail.com | 123456 |
| Bidder | bidder2@gmail.com | 123456 |
| Bidder | bidder3@gmail.com | 123456 |

## Key URLs

| Page | URL |
|------|-----|
| Homepage | / |
| Login | /login |
| Register | /register |
| Auctions | /auctions |
| Auction Detail | /auctions/[id] |
| Admin Dashboard | /admin |
| Seller Dashboard | /seller/auctions |
| Bidder Dashboard | /bidder |
| Profile | /profile |
| Notifications | /notifications |
| Checkout | /checkout |
| Contact | /contact |

## Total Demo Time: ~30 minutes