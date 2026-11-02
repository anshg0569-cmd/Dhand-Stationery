# Dhand Stationery — Professional E-Commerce Website

A complete, modern, and fully functional frontend shopping website for **Dhand Stationery**, designed for a college **Cloud Computing** project demonstration.

---

## 1. Project Overview

- **Business Name:** Dhand Stationery
- **Business Type:** Stationery and General Products Store
- **Project Category:** Business-Oriented E-Commerce Website
- **Project Subject:** Cloud Computing
- **Project Architecture:** 100% Frontend-Only Static Website
- **Target Deployment Platform:** Netlify (or GitHub Pages / Vercel / Cloudflare Pages)
- **Four Dedicated Pages:**
  1. `index.html` — Homepage with announcement bar, hero showcase, 8 categories, 12 featured products, bestsellers, trust features, and newsletter.
  2. `shop.html` — Full product catalogue containing 44+ unique products with live category filtering, search, price range slider, sort options, in-stock toggle, and quick view.
  3. `cart.html` — Shopping cart with stepper, live subtotal/tax/shipping calculations, promo coupons, checkout form with Indian phone and PIN validation, demo payment selection, and simulated order placement.
  4. `login.html` — Customer account and login demonstration with show/hide password, form validation, demo student account shortcut, saved wishlist, and local order history.

---

## 2. Directory Structure

```text
Dhand-Stationery/
│
├── index.html            # Page 1: Homepage
├── shop.html             # Page 2: Product Catalogue (44+ products)
├── cart.html             # Page 3: Shopping Cart & Checkout
├── login.html            # Page 4: Login & Account Dashboard
│
├── css/
│   └── style.css         # Modern responsive design system & typography
│
├── js/
│   ├── products.js       # Complete 44+ item product catalogue data
│   ├── main.js           # Core cart, wishlist, auth, toast, modal helpers
│   ├── shop.js           # Shop filters, search, sorting & pagination
│   ├── cart.js           # Cart stepper, coupons, validation & order creation
│   └── login.js          # Demo login, registration & account dashboard
│
├── images/               # Authentic store photographs & merchandise
│   ├── doms-brush-pens.jpg
│   ├── trio-designer-notebooks.jpg
│   ├── smart-car-rc.jpg
│   ├── dinosaur-3d-pen.jpg
│   ├── digital-finger-counter.jpg
│   ├── mascot-pocket-notebooks.jpg
│   ├── doms-inxify-gel-pens.jpg
│   ├── s10-digital-gamepad.jpg
│   ├── mini-car-diecast-rc.jpg
│   ├── zesto-light-clay.jpg
│   └── doms-inxify-pack.webp
│
└── README.md             # Project documentation & deployment guide
```

---

## 3. How to Open and Run Locally in Visual Studio Code

### Step 1: Open the Project
1. Download or clone the project folder onto your computer.
2. Launch **Visual Studio Code**.
3. Click **File** > **Open Folder...** and select the `Dhand-Stationery` folder.

### Step 2: Preview Locally
You have two easy ways to preview the website locally:

#### Method A: Using VS Code "Live Server" Extension (Recommended for Static Testing)
1. Install the **Live Server** extension by Ritwick Dey in VS Code (Extensions > search "Live Server" > Install).
2. Right-click on `index.html` in the file explorer.
3. Click **"Open with Live Server"**.
4. The website will open in your default browser at `http://127.0.0.1:5500/index.html`.

#### Method B: Using Vite Dev Server (If Node.js is installed)
1. Open the integrated terminal in VS Code (`Ctrl + ~` or `Cmd + ~`).
2. Run `npm install` (first time only).
3. Run `npm run dev`.
4. Open `http://localhost:3000` in your browser.

---

## 4. Testing the Four Pages & Features

### 1. Homepage (`index.html`)
- Click **"Shop Now"** or **"Explore Categories"** to test navigation.
- Click any of the **8 Category Cards** to navigate to `shop.html` with that specific category pre-filtered.
- Click **"Add to Cart"** or the **Wishlist heart** on any of the 12 featured products. Notice the real-time badge count updates in the header.
- Click **"Quick View"** on any card to open the interactive modal with quantity adjustment.
- Submit the newsletter demonstration form with an email.

### 2. Shop Catalogue (`shop.html`)
- Browse all **44+ products** across all departments.
- Use the **Category Filters** in the sidebar.
- Type in the search box to test instant live search.
- Adjust the **Max Price** slider to filter by Indian Rupee budget.
- Change the **Sort By** dropdown (Price: Low to High, High to Low, Highest Rated, Alphabetical).
- Click **"Load More Products"** to test pagination.

### 3. Shopping Cart & Checkout (`cart.html`)
- Increase or decrease item quantities with the `+` / `-` buttons. The subtotal and grand total update automatically.
- Test the sample promo code: enter `DHAND10` or `FIRST10` and click **"Apply"** to receive a 10% discount.
- Observe the **Free Delivery banner**: Orders above ₹499 unlock free delivery.
- Fill out the checkout form with a recipient name, 10-digit mobile number, address, city, and 6-digit PIN code.
- Select your demo payment method (COD, UPI, or Card).
- Click **"Place Demonstration Order"** to view the professional confirmation modal and generated order receipt ID (e.g. `DS-XXXXXX-XXX`).
- Notice that the cart clears only after the order is confirmed, and the order is added to your **Order History**.

### 4. Account & Login (`login.html`)
- Test demo credentials: Click **"Click here to fill Demo Student Account"** to pre-populate `student@dhandstationery.com` / `password123`.
- Test user registration: Switch to "Create Account", enter new credentials, accept the demo terms, and click **"Create Demo Account"**.
- View the **Customer Account Dashboard**: Access saved wishlist items (with quick "Add to Cart"), review past demonstration orders, and test the **"Sign Out"** button.

---

## 5. Netlify Deployment Guide (Step-by-Step)

This website is engineered to run seamlessly on Netlify without needing server configurations, databases, or environment variables.

### Method 1: Netlify Drag & Drop (Easiest - 2 Minutes)
1. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop) and sign in or sign up for a free Netlify account.
2. Drag and drop the entire project folder (containing `index.html`, `shop.html`, `cart.html`, `login.html`, `css/`, `js/`, and `images/`) into the upload zone.
3. Netlify will deploy your static site within seconds and provide a live public URL (e.g., `https://dhand-stationery.netlify.app`).

### Method 2: Git Repository Deployment
1. Push your project files to a GitHub or GitLab repository.
2. In Netlify, click **"Add new site"** > **"Import an existing project"**.
3. Select your repository.
4. For static deployment:
   - **Build command:** *(leave blank or set to `npm run build`)*
   - **Publish directory:** `.` *(or `dist` if using Vite build)*
5. Click **"Deploy site"**.

---

## 6. Important Notes on Local Storage & Demonstration Scope

- **Browser-Specific Data:** All cart items, saved wishlist items, demo accounts, and sample orders are stored in the user's browser via HTML5 `localStorage`.
- **No Synchronization Across Devices:** Data stored in one browser does not automatically synchronize to other browsers or devices.
- **Demonstration Notice:** Login and checkout are clearly identified as frontend educational demonstrations for a college Cloud Computing course. No real credit cards or UPI PINs are collected, and no real physical orders are transmitted to the store.
- **Store Contact Information:** Shop address, phone numbers, and operational hours in the footer are clearly marked placeholders ready to be customized with the store owner's real details.
