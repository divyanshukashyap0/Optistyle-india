# Firestore Security Rules: Production Grade Strategy

This document explains the security architecture implemented in `firestore.rules` for the **OptiStyle Orders Collection**.

## 1. Core Security Logic

We use a "Deny by Default" approach. No public access is allowed. Access is granted only via strict functions.

### Helper Functions
*   **`isAuthenticated()`**: Verifies that `request.auth` is not null.
*   **`isOwner(userId)`**: Strictly compares the requester's UID (`request.auth.uid`) with the target `userId`.
*   **`isAdmin()`**: Performs a **database lookup** (`get()`) on the `users` collection to check if the requester has `role == "admin"`. This prevents token tampering (unlike checking custom claims which can be stale).
*   **`isSeller(sellerId)`**: Grants access if the requester's UID matches the order's `sellerId`.

---

## 2. Order Access Rules (`orders/{orderId}`)

### Read Access
**Rule:**
```javascript
allow read: if isOwner(resource.data.userId) || isSeller(resource.data.sellerId) || isAdmin();
```
*   **Why:** Ensures privacy. A user can *only* see orders where their own ID is stamped.
*   **Seller Access:** Sellers can see orders assigned to them, but *cannot* query orders generally without a filter.

### Create Access
**Rule:**
```javascript
allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
```
*   **Why:** Prevents "Identity Spoofing". A user cannot create an order on behalf of someone else (e.g., Alice cannot create an order that looks like it came from Bob).

### Update Access (Strict)
**Rule:**
```javascript
allow update: if isAdmin() || (isOwner(...) && request.resource.data.status == resource.data.status ...);
```
*   **Why:** Users should not be able to mark their own order as "Paid" or "Shipped".
*   **Mechanism:** We check `request.resource.data.field == resource.data.field` for all sensitive fields (`status`, `total`, `paymentStatus`). If a user tries to change these, the write is rejected.

### Delete Access
**Rule:** `allow delete: if false;`
*   **Why:** Financial records must never be deleted. Cancellation should set `status: 'cancelled'`, not remove the document.

---

## 3. Subcollection Access (`orders/{orderId}/orderItems`)

**Challenge:** Subcollections do not automatically inherit parent rules.
**Solution:** Use `get()` to read the parent document.

**Rule:**
```javascript
allow read: if isOwner(get(/databases/$(database)/documents/orders/$(orderId)).data.userId) ...
```
*   **Explanation:** When a user tries to read an Item, Firestore fetches the *Parent Order*. If the Parent Order belongs to the user, access to the Item is granted.

---

## 4. Edge Cases Handled

1.  **Stale Admin Tokens**: We don't rely on Auth Token Claims for admin status. We check the live `users` collection. If an admin is demoted, their access is revoked immediately.
2.  **Price Tampering**: Users cannot update `total` or `paymentStatus`.
3.  **Order Injection**: Users cannot create an order with `userId: "admin_id"`.
4.  **Subcollection Bypass**: Users cannot access `orderItems` directly via ID unless they own the parent order.

---

## 5. Query Examples (Pass vs Fail)

### ✅ PASS: User Queries Own Orders
```javascript
// Authenticated as User A (uid: "user_A")
db.collection('orders').where('userId', '==', "user_A").get();
```
*Result:* Returns User A's orders.
*Why:* The `where` clause matches the `isOwner` rule.

### ❌ FAIL: User Queries All Orders (No Filter)
```javascript
// Authenticated as User A
db.collection('orders').get();
```
*Result:* **PERMISSION_DENIED**
*Why:* Firestore rules require the query to be bounded by the security rule. Since the rule says "only if userId == auth.uid", a query asking for *all* docs (which might include others) is rejected immediately.

### ❌ FAIL: User Queries Another User's Orders
```javascript
// Authenticated as User A
db.collection('orders').where('userId', '==', "user_B").get();
```
*Result:* **PERMISSION_DENIED**
*Why:* `request.auth.uid` ("user_A") != `resource.data.userId` ("user_B").

### ❌ FAIL: User Tries to Mark Order as Paid
```javascript
db.collection('orders').doc('my_order').update({
  paymentStatus: 'paid'
});
```
*Result:* **PERMISSION_DENIED**
*Why:* The `allow update` rule explicitly checks if `paymentStatus` is unchanged (`request.resource.data.paymentStatus == resource.data.paymentStatus`).

---

## 6. Deployment Instructions

1.  Copy the content of `firestore.rules` to your Firebase Console > Firestore > Rules.
2.  Or deploy via CLI: `firebase deploy --only firestore:rules`.
