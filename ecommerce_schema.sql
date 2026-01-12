-- =======================================================================================
-- OPTISTYLE / E-COMMERCE PRODUCTION DATABASE SCHEMA (PostgreSQL)
-- =======================================================================================
-- Designed for High Scalability (Millions of Users/Orders)
-- Tech Stack: PostgreSQL 14+
-- Features: JSONB for flexibility, UUIDs for security, Normalized core, Partitioning-ready
-- =======================================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Enable LTree for hierarchical categories (optional, but recommended for deep categories)
CREATE EXTENSION IF NOT EXISTS "ltree";

-- =======================================================================================
-- 1. USERS & AUTHENTICATION
-- =======================================================================================

CREATE TYPE user_role AS ENUM ('customer', 'seller', 'admin', 'support');
CREATE TYPE account_status AS ENUM ('active', 'suspended', 'banned', 'deleted');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Argon2 or Bcrypt hash
    full_name VARCHAR(100),
    role user_role DEFAULT 'customer',
    status account_status DEFAULT 'active',
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);

CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) DEFAULT 'home', -- home, work, warehouse
    full_name VARCHAR(100),
    phone VARCHAR(20),
    street_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    pincode VARCHAR(20) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_addresses_user ON user_addresses(user_id);
CREATE INDEX idx_addresses_pincode ON user_addresses(pincode);

-- =======================================================================================
-- 2. PRODUCTS & CATALOG
-- =======================================================================================

CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES categories(id),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    level INTEGER DEFAULT 1,
    path TEXT, -- Materialized path for efficient tree traversal (e.g., "1/5/12")
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES brands(id),
    category_id UUID REFERENCES categories(id),
    seller_id UUID REFERENCES users(id), -- Owner of the listing (if marketplace model)
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL, -- Base price for display
    specifications JSONB DEFAULT '{}', -- Flexible specs: { "material": "metal", "weight": "20g" }
    is_active BOOLEAN DEFAULT TRUE,
    is_digital BOOLEAN DEFAULT FALSE,
    rating_avg DECIMAL(3, 2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_specs ON products USING GIN (specifications); -- Fast JSON search

CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL, -- Stock Keeping Unit
    attributes JSONB NOT NULL, -- { "color": "red", "size": "L", "lens": "anti-glare" }
    price_override DECIMAL(10, 2), -- If different from base price
    mrp DECIMAL(10, 2), -- Maximum Retail Price
    stock_quantity INTEGER DEFAULT 0, -- Denormalized total stock (sum of warehouses)
    images JSONB, -- ["url1", "url2"]
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_sku ON product_variants(sku);

-- =======================================================================================
-- 3. SELLERS & INVENTORY
-- =======================================================================================

CREATE TABLE seller_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    business_name VARCHAR(200) NOT NULL,
    gstin VARCHAR(15) UNIQUE,
    pan_number VARCHAR(10),
    is_verified BOOLEAN DEFAULT FALSE,
    commission_rate DECIMAL(5, 2) DEFAULT 10.00, -- Platform fee percentage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES users(id),
    name VARCHAR(100),
    address_id UUID REFERENCES user_addresses(id),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID REFERENCES product_variants(id),
    warehouse_id UUID REFERENCES warehouses(id),
    quantity INTEGER DEFAULT 0 CHECK (quantity >= 0),
    reserved_quantity INTEGER DEFAULT 0 CHECK (reserved_quantity >= 0), -- Items in cart/processing
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(variant_id, warehouse_id)
);

-- =======================================================================================
-- 4. PRICING & DISCOUNTS
-- =======================================================================================

CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_value DECIMAL(10, 2) DEFAULT 0,
    max_discount_amount DECIMAL(10, 2),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- =======================================================================================
-- 5. CART & WISHLIST
-- =======================================================================================

CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id), -- Nullable for guest carts
    guest_id VARCHAR(100), -- Cookie/Session ID for guests
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id),
    quantity INTEGER DEFAULT 1,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cart_id, variant_id)
);

CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- =======================================================================================
-- 6. ORDERS & PAYMENTS
-- =======================================================================================

CREATE TYPE order_status AS ENUM (
    'pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    address_id UUID REFERENCES user_addresses(id), -- Snapshot address ID
    shipping_address_snapshot JSONB NOT NULL, -- Full address copy at time of order (audit trail)
    
    total_amount DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    shipping_fee DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    final_amount DECIMAL(10, 2) NOT NULL,
    
    status order_status DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed, refunded
    payment_method VARCHAR(50), -- COD, UPI, CARD
    
    coupon_id UUID REFERENCES coupons(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(created_at);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id),
    seller_id UUID REFERENCES users(id),
    
    quantity INTEGER NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL, -- Price at time of purchase
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    
    status VARCHAR(50) DEFAULT 'pending', -- Item level status (e.g. one item cancelled)
    return_window_closes_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    transaction_id VARCHAR(100), -- Gateway Transaction ID
    gateway VARCHAR(50), -- Razorpay, Stripe
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50), -- success, failed, pending
    payment_response JSONB, -- Full gateway response dump
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =======================================================================================
-- 7. SHIPPING & LOGISTICS
-- =======================================================================================

CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    courier_partner VARCHAR(100), -- Delhivery, BlueDart
    tracking_id VARCHAR(100),
    status VARCHAR(50),
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE shipment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID REFERENCES shipments(id),
    status VARCHAR(50),
    location VARCHAR(100),
    description TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =======================================================================================
-- 8. RETURNS & REVIEWS
-- =======================================================================================

CREATE TABLE returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    order_item_id UUID REFERENCES order_items(id),
    user_id UUID REFERENCES users(id),
    reason VARCHAR(50), -- size_issue, defective, etc.
    description TEXT,
    images JSONB,
    status VARCHAR(50) DEFAULT 'requested', -- requested, approved, picked_up, refunded, rejected
    refund_amount DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    user_id UUID REFERENCES users(id),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(100),
    comment TEXT,
    images JSONB,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE, -- Auto-approve, moderate later
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id) -- One review per product per user
);

-- =======================================================================================
-- 9. ANALYTICS & LOGS (High Volume)
-- =======================================================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- Nullable for system actions
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50), -- ORDER, PRODUCT, USER
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- Partitioning example for logs (monthly)
CREATE TABLE audit_logs_y2024m01 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- =======================================================================================
-- VIEWS FOR PERFORMANCE
-- =======================================================================================

-- Product Listing View (Denormalized for frontend speed)
CREATE VIEW view_product_listings AS
SELECT 
    p.id, p.name, p.slug, p.base_price, p.rating_avg, p.rating_count,
    b.name as brand_name, c.name as category_name,
    (SELECT image_url FROM product_variants WHERE product_id = p.id LIMIT 1) as main_image
FROM products p
JOIN brands b ON p.brand_id = b.id
JOIN categories c ON p.category_id = c.id
WHERE p.is_active = TRUE;
