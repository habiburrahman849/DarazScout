# DarazScout — PK FBM Profit & Margin Calculator






**DarazScout** is a fast, offline-ready seller analytics and profit calculator built for **Daraz Pakistan (Fulfillment by Merchant)** sellers. Designed with a clean SaaS dashboard layout, it helps you validate product margins, calculate break-even prices, project monthly profits, and compare products side by side—with zero backend or login required.

---

## Key Features

- **7,851 PK Categories (May 2026 Rates):** Instant search-as-you-type category autocomplete that auto-fills the exact Daraz Pakistan marketplace commission rate.
- **4 Live KPI Cards:** View **Net Profit / Unit**, **Net Profit Margin (%)**, **Return on Investment (ROI %)**, and **Break-Even Price** in real time.
- **Visual Revenue Breakdown Bar:** See exactly what percentage of your selling price goes to **Net Profit**, **Product Cost**, **Commission + VAT**, and **Other Fees & Taxes**.
- **Complete 2026 FBM Fee & Tax Modeling:**
  - **Marketplace Commission** (0%–20%+ by subcategory)
  - **Provincial VAT:** 15% (KPK, Sindh, Balochistan) and 16% (Punjab)
  - **Payment Fee:** 2.25% on delivered orders (COD & Prepaid)
  - **Handling / Pickup Fee:** Drop-off slabs (Rs. 10–60) or Pickup (<8 kg Rs. 30 / 8 kg+ Rs. 120)
  - **Campaigns & Taxes:** Optional Free Shipping Max (~6%), Voucher Max (2%), and ATL / Non-ATL withholding tax
- **Monthly Scaling Projection:** Estimate monthly revenue, total Daraz fees, and net monthly profit based on your expected unit volume.
- **Product Comparison & CSV Export:** Save multiple products in your browser (`localStorage`) and export your comparison table to `.csv` in one click.

---

## Core Commission & VAT Formula

```text
Commission Value    = Product Unit Price (with Discount) × Category Commission %
VAT on Commission   = Commission Value × Province VAT %
Commission with VAT = Commission Value + VAT on Commission
```

---

## Project Structure

```text
DarazScout/
├── index.html       # Dashboard layout, KPI cards, and comparison table
├── style.css        # Responsive SaaS styling and breakdown bar
├── categories.js    # 7,851 Daraz Pakistan product categories & May 2026 rates
├── script.js        # FBM fee engine, break-even solver, and CSV export
└── README.md        # Project documentation
```

---

## Quick Start

1. Clone or download this repository:
   ```bash
   git clone https://github.com/habiburrahman849/DarazScout.git
   ```
2. Open `index.html` in Chrome, Edge, or any modern browser (works 100% offline).
3. Search your product category, enter your **Selling Price** and **Product + Packaging Cost**, and click **+ Save to Comparison** to track winning products.

---

## Author

Built by **[@habiburrahman849](https://github.com/habiburrahman849)** for Pakistani e-commerce sellers and students.
