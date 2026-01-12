# Enterprise Firestore Database Design for Eyewear E-Commerce

This document outlines a production-grade, scalable NoSQL database design for an eyewear e-commerce platform (similar to Lenskart/Amazon) using **Firebase Authentication** and **Cloud Firestore**.

## 1. Core Architecture Principles

*   **Read-Optimized**: Data is denormalized (duplicated) to minimize client-side joins and maximize read speed.
*   **Sharding & Partitioning**: Large collections are designed to be queryable without hitting limits.
*   **Security**: Role-based access control (RBAC) via Firestore Rules.
*   **Scalability**: Subcollections used for unbounded lists (e.g., Orders, Reviews).

---

## 2. Collection Structure (Tree View)

```text
├── users/                      # [Collection] Customer & Admin Profiles
│   └── {userId}/
│       ├── addresses/          # [Subcollection] Multiple shipping addresses
│       ├── prescriptions/      # [Subcollection] Eye test reports & power details
│       ├── cart/               # [Subcollection] Private cart items
│       └── wishlist/           # [Subcollection] Saved items
│
├── products/                   # [Collection] Catalog (Eyewear specific)
│   └── {productId}/
│       └── variants/           # [Subcollection] SKUs (Colors, Sizes) - Optional if < 20 variants
│
├── categories/                 # [Collection] Hierarchical Tree (Men > Eyeglasses > Rimless)
│
├── sellers/                    # [Collection] Marketplace Sellers
│   └── {sellerId}/
│       └── inventory/          # [Subcollection] Stock & Price per SKU
│
├── orders/                     # [Collection] Central Order Management
│   └── {orderId}/
│       ├── orderItems/         # [Subcollection] Line items (prevents 1MB doc limit)
│       └── statusHistory/      # [Subcollection] Audit trail of status changes
│
├── shipments/                  # [Collection] Logistics & Tracking
│
├── reviews/                    # [Collection] Product Ratings (Top-level for querying)
│
├── coupons/                    # [Collection] Discounts & Offers
│
└── audit_logs/                 # [Collection] Admin actions & security events
```

---

## 3. Detailed Schema & Sample Documents

### 1. Users & Authentication
**Collection:** `users`
**ID:** `Auth UID`

```json
// users/{userId}
{
  "uid": "user_123",
  "email": "divya@example.com",
  "phone": "+919876543210",
  "displayName": "Divya Test",
  "role": "customer", // 'customer' | 'seller' | 'admin' | 'support'
  "status": "active", // 'active' | 'blocked'
  "createdAt": "2024-01-10T10:00:00Z",
  "lastLogin": "2024-01-10T12:30:00Z",
  "preferences": {
    "newsletter": true,
    "defaultLensType": "blu_cut"
  }
}
```

**Subcollection:** `users/{userId}/addresses`
```json
{
  "label": "Home",
  "recipientName": "Divya Test",
  "street": "123 MG Road",
  "city": "Bangalore",
  "state": "Karnataka",
  "zip": "560001",
  "country": "IN",
  "isDefault": true,
  "location": { "lat": 12.9716, "lng": 77.5946 } // For delivery estimation
}
```

**Subcollection:** `users/{userId}/prescriptions` (Eyewear Specific)
```json
{
  "name": "My Reading Glasses",
  "doctorName": "Dr. Vision",
  "testDate": "2023-12-01",
  "expiryDate": "2024-12-01",
  "leftEye": { "sph": -1.5, "cyl": -0.5, "axis": 90, "add": 2.0 },
  "rightEye": { "sph": -1.25, "cyl": 0, "axis": 0, "add": 2.0 },
  "pd": 62, // Pupillary Distance
  "attachmentUrl": "https://storage.googleapis.com/.../rx_scan.jpg"
}
```

---

### 2. Products & Catalog
**Collection:** `products`
**ID:** `Auto-ID` or `Slug`

```json
// products/{productId}
{
  "title": "Ray-Ban Aviator Classic",
  "slug": "ray-ban-aviator-classic-gold",
  "brand": "Ray-Ban",
  "categoryPath": ["men", "sunglasses", "aviator"], // Array for array-contains queries
  "basePrice": 5,
  "mrp": 7999,
  "description": "...",
  "specifications": {
    "frameMaterial": "Metal",
    "frameShape": "Aviator",
    "frameType": "Full Rim",
    "weight": "25g"
  },
  "images": ["url1", "url2"],
  "rating": 4.5,
  "reviewCount": 120,
  "isActive": true,
  "tags": ["bestseller", "new-arrival"],
  "searchKeywords": ["rayban", "gold", "pilot", "sun glasses"] // Manual indexing helper
}
```

---

### 3. Sellers & Inventory
**Collection:** `sellers`
```json
// sellers/{sellerId}
{
  "businessName": "Visionary Optics Ltd",
  "gstNumber": "29ABCDE1234F1Z5",
  "verificationStatus": "verified",
  "rating": 4.8,
  "contactEmail": "sales@visionary.com"
}
```

**Subcollection:** `sellers/{sellerId}/inventory`
This allows multiple sellers to sell the same product at different prices.
```json
// sellers/{sellerId}/inventory/{productId}
{
  "productId": "prod_rayban_123",
  "sku": "RB-AV-GLD-001",
  "stockQuantity": 50,
  "warehouseLocation": "Mumbai_WH_01",
  "sellingPrice": 5499, // Seller specific price
  "isActive": true
}
```

---

### 4. Pricing & Tax (India/GST Ready)
**Collection:** `orders` (Snapshot strategy)
When an order is placed, we copy the price and tax rates *at that moment*.

```json
// Inside an order item snapshot
{
  "price": 1000,
  "tax": {
    "gstRate": 18, // 18%
    "cgst": 90,
    "sgst": 90,
    "igst": 0,
    "hsnCode": "9004"
  }
}
```

---

### 5. Cart & Wishlist
**Subcollection:** `users/{userId}/cart`
```json
// users/{userId}/cart/{itemId}
{
  "productId": "prod_123",
  "variantId": "var_gold_01",
  "quantity": 1,
  "addedAt": "timestamp",
  "selectedPrescriptionId": "rx_001", // Link to user's saved prescription
  "lensAddon": {
    "type": "blu_cut",
    "price": 500
  }
}
```
*Guest Cart Strategy:* Store cart in `localStorage` on the client. Upon login, merge `localStorage` cart with Firestore cart via a Cloud Function or client-side logic.

---

### 6. Orders & Payments (CRITICAL)
**Collection:** `orders`
**ID:** `ord_{timestamp}_{random}`

```json
// orders/{orderId}
{
  "userId": "user_123",
  "status": "processing", // pending, paid, processing, shipped, delivered, cancelled
  "paymentStatus": "paid",
  "paymentMethod": "razorpay",
  "paymentDetails": {
    "transactionId": "pay_K123456",
    "gateway": "Razorpay"
  },
  "totals": {
    "subtotal": 5999,
    "tax": 1080,
    "discount": 500,
    "grandTotal": 6579
  },
  "shippingAddress": { ... }, // SNAPSHOT of address at time of order
  "createdAt": "timestamp",
  "estimatedDelivery": "timestamp"
}
```

**Subcollection:** `orders/{orderId}/orderItems`
```json
{
  "productId": "prod_123",
  "name": "Ray-Ban Aviator",
  "quantity": 1,
  "unitPrice": 5999,
  "sellerId": "seller_01",
  "prescriptionSnapshot": { ... }, // Copy of prescription used
  "status": "active" // active, returned, cancelled
}
```

---

### 7. Shipping & Delivery
**Collection:** `shipments`
One order can be split into multiple shipments (if items come from different warehouses).

```json
// shipments/{shipmentId}
{
  "orderId": "ord_123",
  "trackingNumber": "AWB123456789",
  "carrier": "Delhivery",
  "status": "in_transit",
  "timeline": [
    { "status": "picked_up", "timestamp": "...", "location": "Mumbai" },
    { "status": "in_transit", "timestamp": "...", "location": "Pune" }
  ]
}
```

---

## 4. Security Rules (Firestore Security)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Users: Users can read/write their own profile; Admins can read all
    match /users/{userId} {
      allow read, write: if isAuthenticated() && (isOwner(userId) || isAdmin());
      
      match /cart/{itemId} {
        allow read, write: if isAuthenticated() && isOwner(userId);
      }
      match /addresses/{addressId} {
        allow read, write: if isAuthenticated() && isOwner(userId);
      }
    }

    // Products: Public read, Admin write
    match /products/{productId} {
      allow read: if true;
      allow write: if isAuthenticated() && isAdmin();
    }

    // Orders: Users read own, Admins read all. No direct delete.
    match /orders/{orderId} {
      allow read: if isAuthenticated() && (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if isAuthenticated(); // Server-side validation recommended via Cloud Functions
      allow update: if isAuthenticated() && isAdmin();
    }
  }
}
```

---

## 5. Scaling & Performance Strategy

1.  **Denormalization**:
    *   **Why**: Firestore charges per read.
    *   **How**: Store `productName`, `image`, and `price` inside the `orderItems` document. This avoids fetching the `products` collection when displaying Order History.

2.  **Indexing**:
    *   **Composite Indexes**: Required for queries like "Products where category=='sunglasses' AND price < 1000".
    *   **Exemptions**: Disable indexing on large text fields (like `description`) to save storage costs.

3.  **Sharding Counters**:
    *   For `product.reviewCount`, don't update the document 100 times a second. Use a distributed counter (shards) if you expect 1000+ writes/second. For typical usage, Cloud Functions `onWrite` triggers are sufficient to update aggregates.

4.  **Algolia / ElasticSearch**:
    *   Firestore has no native full-text search (fuzzy search).
    *   **Strategy**: Sync `products` collection to Algolia/Meilisearch via Cloud Functions for the search bar logic.

## 6. Eyewear Specific Features

*   **Prescription Validation**: Use Cloud Functions to validate that `sph` (Sphere) + `cyl` (Cylinder) values are within manufacturable ranges before accepting an order.
*   **Lens Inventory**: Lenses are often "made to order" or stocked as raw blanks. Manage them in a separate `materials` collection if you are manufacturing, or as simple `addons` in the product schema if you are retailing.

---
**Generated by Trae AI for OptiStyle**
