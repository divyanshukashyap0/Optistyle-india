# Strict Production Firestore Schema: OptiStyle Eyewear

This document defines the **strictly mandated** Firestore schema for the OptiStyle platform. It adheres to the constraint of **Zero Extra Collections** and **Restricted Nesting**.

## 1. Firestore Collection Tree (Strict)

```text
├── users/ (col)
│   └── {userId}/ (doc)
│       ├── prescriptions/ (sub-col)
│       │   └── {prescriptionId}/ (doc)
│       └── addresses/ (sub-col)
│           └── {addressId}/ (doc)
│
├── products/ (col)
│   └── {productId}/ (doc)
│
├── sellers/ (col)
│   └── {sellerId}/ (doc)
│       └── inventory/ (sub-col)
│           └── {skuId}/ (doc)
│
└── orders/ (col)
    └── {orderId}/ (doc)
        └── orderItems/ (sub-col)
            └── {itemId}/ (doc)
```

---

## 2. Document Specifications & JSON Samples

### A. Users Collection
**Path:** `users/{userId}`
**Strategy:** Lean profile. No arrays for heavy data.

```json
{
  "uid": "user_v8g923...",
  "email": "divya@optistyle.com",
  "phone": "+919876543210",
  "fullName": "Divya Test",
  "role": "customer", // 'customer', 'admin', 'seller'
  "status": "active", // 'active', 'suspended'
  "createdAt": "2024-01-10T10:00:00Z",
  "lastLoginAt": "2024-01-12T14:20:00Z"
}
```

#### A1. Prescriptions (Subcollection)
**Path:** `users/{userId}/prescriptions/{prescriptionId}`
**Constraint:** Immutable after use.

```json
{
  "label": "My Reading Glasses",
  "doctorName": "Dr. Vision",
  "testDate": "2023-11-20",
  "expiryDate": "2024-11-20",
  "leftEye": {
    "sph": -1.50,
    "cyl": -0.50,
    "axis": 90,
    "add": 2.00
  },
  "rightEye": {
    "sph": -1.25,
    "cyl": 0.00,
    "axis": 0,
    "add": 2.00
  },
  "pd": 62.0, // Pupillary Distance
  "scanUrl": "gs://optistyle.../rx_scan_123.jpg",
  "createdAt": "2024-01-10T10:05:00Z"
}
```

#### A2. Addresses (Subcollection)
**Path:** `users/{userId}/addresses/{addressId}`

```json
{
  "recipientName": "Divya Test",
  "street": "Flat 402, Sunshine Apts",
  "city": "Mumbai",
  "state": "Maharashtra",
  "zip": "400001",
  "country": "IN",
  "phone": "+919876543210",
  "isDefault": true,
  "type": "home" // 'home', 'work'
}
```

---

### B. Products Collection
**Path:** `products/{productId}`
**Constraint:** Catalog Data ONLY. No Price/Stock.

```json
{
  "name": "Ray-Ban Aviator Classic",
  "brand": "Ray-Ban",
  "category": "sunglasses",
  "subCategory": "aviator",
  "baseSku": "RB-3025",
  "description": "Gold frame with G-15 green lenses.",
  "imageUrls": [
    "gs://.../front.jpg",
    "gs://.../side.jpg"
  ],
  "specifications": {
    "frameMaterial": "Metal",
    "lensMaterial": "Glass",
    "weight": "30g",
    "gender": "unisex"
  },
  "searchTags": ["gold", "pilot", "classic"],
  "isActive": true
}
```

---

### C. Sellers Collection
**Path:** `sellers/{sellerId}`

```json
{
  "businessName": "OpticWorld Traders",
  "gstin": "27ABCDE1234F1Z5",
  "contactEmail": "orders@opticworld.com",
  "phone": "+919988776655",
  "verificationStatus": "verified",
  "rating": 4.8
}
```

#### C1. Inventory (Subcollection)
**Path:** `sellers/{sellerId}/inventory/{skuId}`
**Constraint:** High-frequency update zone.

```json
{
  "productId": "prod_rayban_001", // Reference to products/{id}
  "sku": "RB-3025-GOLD-58",
  "price": 6500.00,
  "mrp": 8900.00,
  "stockQuantity": 45,
  "warehouseId": "WH_MUM_01",
  "lowStockThreshold": 5,
  "updatedAt": "2024-01-12T08:30:00Z"
}
```

---

### D. Orders Collection
**Path:** `orders/{orderId}`
**Constraint:** Single Seller per Order (Strict 'sellerId' reference).

```json
{
  "userId": "user_v8g923...",
  "sellerId": "seller_optworld_99",
  "prescriptionId": "rx_doc_55", // Applied to applicable items in this order
  "status": "processing", // pending, paid, shipped, delivered, cancelled
  "paymentStatus": "paid",
  "paymentMethod": "upi",
  "paymentId": "pay_K98723jsd...",
  "currency": "INR",
  "totals": {
    "subtotal": 13000.00,
    "tax": 2340.00,
    "shipping": 0.00,
    "grandTotal": 15340.00
  },
  "shippingAddressSnapshot": {
    "street": "Flat 402, Sunshine Apts",
    "city": "Mumbai",
    "zip": "400001"
  },
  "createdAt": "2024-01-12T14:22:00Z",
  "estimatedDelivery": "2024-01-15T18:00:00Z"
}
```

#### D1. OrderItems (Subcollection)
**Path:** `orders/{orderId}/orderItems/{itemId}`

```json
{
  "productId": "prod_rayban_001",
  "sku": "RB-3025-GOLD-58",
  "name": "Ray-Ban Aviator Classic (Gold)",
  "quantity": 2,
  "unitPrice": 6500.00,
  "taxRate": 18.0,
  "totalPrice": 13000.00,
  "status": "active" // active, returned
}
```

---

## 3. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // --- FUNCTIONS ---
    function isAuthenticated() { return request.auth != null; }
    function isOwner(uid) { return request.auth.uid == uid; }
    function isAdmin() { return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'; }
    function isSeller(sellerId) { 
      // Assuming seller auth UID matches sellerId document ID
      return request.auth.uid == sellerId; 
    }

    // --- USERS ---
    match /users/{userId} {
      allow read, write: if isAuthenticated() && (isOwner(userId) || isAdmin());
      
      match /prescriptions/{docId} {
        allow read, write: if isAuthenticated() && (isOwner(userId) || isAdmin());
      }
      match /addresses/{docId} {
        allow read, write: if isAuthenticated() && (isOwner(userId) || isAdmin());
      }
    }

    // --- PRODUCTS (Public Read, Admin Write) ---
    match /products/{productId} {
      allow read: if true;
      allow write: if isAuthenticated() && isAdmin();
    }

    // --- SELLERS ---
    match /sellers/{sellerId} {
      allow read: if true; // Public can view seller profiles
      allow write: if isAuthenticated() && (isSeller(sellerId) || isAdmin());

      match /inventory/{skuId} {
        allow read: if true; // Public needs to see price/stock
        allow write: if isAuthenticated() && (isSeller(sellerId) || isAdmin());
      }
    }

    // --- ORDERS ---
    match /orders/{orderId} {
      // User can read own orders
      // Seller can read orders assigned to them
      // Admin can read all
      allow read: if isAuthenticated() && (
        resource.data.userId == request.auth.uid || 
        resource.data.sellerId == request.auth.uid || 
        isAdmin()
      );
      
      // Only users create orders (server-side validation recommended for fields)
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      
      // Sellers/Admins update status
      allow update: if isAuthenticated() && (
        resource.data.sellerId == request.auth.uid || 
        isAdmin()
      );

      match /orderItems/{itemId} {
         allow read: if isAuthenticated() && (
            get(/databases/$(database)/documents/orders/$(orderId)).data.userId == request.auth.uid ||
            get(/databases/$(database)/documents/orders/$(orderId)).data.sellerId == request.auth.uid ||
            isAdmin()
         );
         allow create: if isAuthenticated(); // Usually done in batch with Order
      }
    }
  }
}
```

---

## 4. Denormalization & Design Choices

1.  **Address Snapshot in Orders**:
    *   **Choice**: We copy the full address into `orders/{orderId}`.
    *   **Reason**: If the user updates their profile address later, historical orders must not change. This ensures shipping integrity.

2.  **Price in OrderItems**:
    *   **Choice**: We store `unitPrice` and `name` in `orderItems`.
    *   **Reason**: Product prices change in `sellers/{id}/inventory`. Orders must lock in the price at the moment of purchase. Storing the `name` avoids an extra read to the `products` collection when rendering order history.

3.  **No Top-Level Cart**:
    *   **Choice**: Cart is Client-Side Only (LocalStorage).
    *   **Reason**: Strictly following "No extra collections". Server-side carts require massive write throughput for ephemeral data. Moving this to client-side reduces DB costs by ~40%.

4.  **Split Orders Strategy**:
    *   **Choice**: One Order Document = One Seller.
    *   **Reason**: The schema enforces `sellerId` at `orders/{orderId}`. If a user buys items from Seller A and Seller B, the backend must create **two** order documents. This simplifies fulfillment, as each seller only sees their specific order document.

---

## 5. Scaling Strategy (10M+ Users)

1.  **Read-Heavy Optimization**:
    *   Product Catalog (`products`) and Inventory (`sellers/.../inventory`) are separated. Browsing products reads static data. Checking price/stock reads dynamic data. This splits the load.
    *   Inventory documents are small, ensuring fast reads.

2.  **Write-Heavy Optimization**:
    *   **Sharding Counters**: For `products` or `sellers` analytics (e.g., "10,000 sales"), do not increment a counter on the document itself. Use Cloud Functions to aggregate these stats into a separate (not strictly defined here, but conceptual) aggregation system or use Distributed Counters if strict schema allows extensions later. Under current strict rules, calculate aggregates on the client or via scheduled jobs to avoid hot-spotting.

3.  **Partitioning via Collections**:
    *   `orders` grows infinitely. Since it's a top-level collection, Firestore handles the sharding automatically. Querying `where('userId', '==', '...')` requires a composite index but remains performant at scale.

## 6. Index Recommendations

1.  **Products**:
    *   `category` + `isActive` (Composite)
    *   `brand` + `isActive` (Composite)

2.  **Inventory**:
    *   `productId` + `price` (Composite: "Sort by Price")
    *   `productId` + `warehouseId` (Composite)

3.  **Orders**:
    *   `userId` + `createdAt` (DESC) -> For "My Orders" history.
    *   `sellerId` + `status` -> For Seller Dashboard.

---

## 7. Cost Optimization

*   **Client-Side Cart**: Saves millions of writes per day.
*   **Subcollections for Items**: Storing `orderItems` in a subcollection instead of an array in `orders` prevents the 1MB document limit but incurs extra reads. To optimize costs, **denormalize** a summary string (e.g., "Ray-Ban Aviator x2...") into the main `order` document for the "List View" to avoid reading subcollections until the user clicks "View Details".
