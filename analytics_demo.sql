-- =====================================================
-- Analytics Demo Database Setup
-- Database: analytics_demo
-- Purpose: Sample database for analytics dashboards
-- 
-- Note: This script is designed to run automatically when
-- the Docker container starts. The database 'analytics_demo'
-- is already created by Docker, so we proceed directly to
-- creating tables and inserting data.
-- =====================================================

-- =====================================================
-- Drop existing tables (if any) in reverse dependency order
-- =====================================================

DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- Create Tables
-- =====================================================

-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    country VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products Table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Orders Table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    order_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Order Items Table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 5. Payments Table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- =====================================================
-- Create Indexes for Better Query Performance
-- =====================================================

CREATE INDEX idx_users_country ON users(country);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_payment_status ON payments(payment_status);

-- =====================================================
-- Insert Sample Data
-- =====================================================

-- Insert Users
INSERT INTO users (name, email, country, created_at) VALUES
('John Smith', 'john.smith@example.com', 'United States', '2024-01-15 10:30:00'),
('Maria Garcia', 'maria.garcia@example.com', 'Spain', '2024-01-16 14:20:00'),
('David Chen', 'david.chen@example.com', 'China', '2024-01-17 09:15:00'),
('Emma Johnson', 'emma.johnson@example.com', 'United Kingdom', '2024-01-18 11:45:00'),
('Lucas Silva', 'lucas.silva@example.com', 'Brazil', '2024-01-19 16:00:00'),
('Sophie Martin', 'sophie.martin@example.com', 'France', '2024-01-20 13:30:00'),
('Ahmed Hassan', 'ahmed.hassan@example.com', 'Egypt', '2024-01-21 08:20:00'),
('Yuki Tanaka', 'yuki.tanaka@example.com', 'Japan', '2024-01-22 15:10:00'),
('Anna Kowalski', 'anna.kowalski@example.com', 'Poland', '2024-01-23 12:00:00'),
('Michael Brown', 'michael.brown@example.com', 'Canada', '2024-01-24 10:00:00');

-- Insert Products
INSERT INTO products (name, category, price, created_at) VALUES
('Wireless Headphones', 'Electronics', 79.99, '2024-01-01 00:00:00'),
('Smart Watch', 'Electronics', 249.99, '2024-01-01 00:00:00'),
('Laptop Stand', 'Accessories', 34.99, '2024-01-01 00:00:00'),
('USB-C Cable', 'Accessories', 12.99, '2024-01-01 00:00:00'),
('Mechanical Keyboard', 'Electronics', 129.99, '2024-01-01 00:00:00'),
('Wireless Mouse', 'Accessories', 29.99, '2024-01-01 00:00:00'),
('Monitor 27"', 'Electronics', 399.99, '2024-01-01 00:00:00'),
('Webcam HD', 'Electronics', 89.99, '2024-01-01 00:00:00'),
('Desk Lamp', 'Furniture', 45.99, '2024-01-01 00:00:00'),
('Ergonomic Chair', 'Furniture', 299.99, '2024-01-01 00:00:00'),
('Standing Desk', 'Furniture', 549.99, '2024-01-01 00:00:00'),
('Cable Management Kit', 'Accessories', 19.99, '2024-01-01 00:00:00');

-- Insert Orders
INSERT INTO orders (user_id, order_date, status, created_at) VALUES
(1, '2024-02-01', 'completed', '2024-02-01 10:15:00'),
(2, '2024-02-02', 'completed', '2024-02-02 14:30:00'),
(3, '2024-02-03', 'completed', '2024-02-03 09:20:00'),
(1, '2024-02-04', 'completed', '2024-02-04 11:45:00'),
(4, '2024-02-05', 'completed', '2024-02-05 13:10:00'),
(5, '2024-02-06', 'completed', '2024-02-06 15:30:00'),
(2, '2024-02-07', 'completed', '2024-02-07 10:00:00'),
(6, '2024-02-08', 'completed', '2024-02-08 12:20:00'),
(7, '2024-02-09', 'completed', '2024-02-09 14:45:00'),
(3, '2024-02-10', 'completed', '2024-02-10 16:00:00'),
(8, '2024-02-11', 'completed', '2024-02-11 09:30:00'),
(4, '2024-02-12', 'completed', '2024-02-12 11:15:00'),
(9, '2024-02-13', 'completed', '2024-02-13 13:40:00'),
(10, '2024-02-14', 'completed', '2024-02-14 15:20:00'),
(5, '2024-02-15', 'pending', '2024-02-15 10:00:00'),
(1, '2024-02-16', 'completed', '2024-02-16 12:30:00'),
(6, '2024-02-17', 'completed', '2024-02-17 14:00:00'),
(7, '2024-02-18', 'completed', '2024-02-18 16:15:00'),
(8, '2024-02-19', 'completed', '2024-02-19 09:45:00'),
(9, '2024-02-20', 'completed', '2024-02-20 11:30:00');

-- Insert Order Items
INSERT INTO order_items (order_id, product_id, quantity, price, created_at) VALUES
-- Order 1 (John Smith)
(1, 1, 2, 79.99, '2024-02-01 10:15:00'),
(1, 3, 1, 34.99, '2024-02-01 10:15:00'),
-- Order 2 (Maria Garcia)
(2, 2, 1, 249.99, '2024-02-02 14:30:00'),
(2, 4, 3, 12.99, '2024-02-02 14:30:00'),
-- Order 3 (David Chen)
(3, 5, 1, 129.99, '2024-02-03 09:20:00'),
(3, 6, 1, 29.99, '2024-02-03 09:20:00'),
(3, 12, 2, 19.99, '2024-02-03 09:20:00'),
-- Order 4 (John Smith - second order)
(4, 7, 1, 399.99, '2024-02-04 11:45:00'),
(4, 8, 1, 89.99, '2024-02-04 11:45:00'),
-- Order 5 (Emma Johnson)
(5, 9, 1, 45.99, '2024-02-05 13:10:00'),
(5, 10, 1, 299.99, '2024-02-05 13:10:00'),
-- Order 6 (Lucas Silva)
(6, 11, 1, 549.99, '2024-02-06 15:30:00'),
(6, 12, 1, 19.99, '2024-02-06 15:30:00'),
-- Order 7 (Maria Garcia - second order)
(7, 1, 1, 79.99, '2024-02-07 10:00:00'),
(7, 3, 2, 34.99, '2024-02-07 10:00:00'),
-- Order 8 (Sophie Martin)
(8, 2, 1, 249.99, '2024-02-08 12:20:00'),
(8, 5, 1, 129.99, '2024-02-08 12:20:00'),
-- Order 9 (Ahmed Hassan)
(9, 4, 5, 12.99, '2024-02-09 14:45:00'),
(9, 6, 2, 29.99, '2024-02-09 14:45:00'),
-- Order 10 (David Chen - second order)
(10, 7, 1, 399.99, '2024-02-10 16:00:00'),
(10, 9, 1, 45.99, '2024-02-10 16:00:00'),
-- Order 11 (Yuki Tanaka)
(11, 10, 1, 299.99, '2024-02-11 09:30:00'),
(11, 11, 1, 549.99, '2024-02-11 09:30:00'),
-- Order 12 (Emma Johnson - second order)
(12, 1, 1, 79.99, '2024-02-12 11:15:00'),
(12, 2, 1, 249.99, '2024-02-12 11:15:00'),
(12, 3, 1, 34.99, '2024-02-12 11:15:00'),
-- Order 13 (Anna Kowalski)
(13, 5, 1, 129.99, '2024-02-13 13:40:00'),
(13, 6, 1, 29.99, '2024-02-13 13:40:00'),
(13, 8, 1, 89.99, '2024-02-13 13:40:00'),
-- Order 14 (Michael Brown)
(14, 7, 1, 399.99, '2024-02-14 15:20:00'),
(14, 9, 1, 45.99, '2024-02-14 15:20:00'),
-- Order 15 (Lucas Silva - second order, pending)
(15, 4, 2, 12.99, '2024-02-15 10:00:00'),
-- Order 16 (John Smith - third order)
(16, 2, 1, 249.99, '2024-02-16 12:30:00'),
(16, 5, 1, 129.99, '2024-02-16 12:30:00'),
-- Order 17 (Sophie Martin - second order)
(17, 10, 1, 299.99, '2024-02-17 14:00:00'),
(17, 12, 1, 19.99, '2024-02-17 14:00:00'),
-- Order 18 (Ahmed Hassan - second order)
(18, 1, 1, 79.99, '2024-02-18 16:15:00'),
(18, 3, 1, 34.99, '2024-02-18 16:15:00'),
(18, 6, 1, 29.99, '2024-02-18 16:15:00'),
-- Order 19 (Yuki Tanaka - second order)
(19, 8, 1, 89.99, '2024-02-19 09:45:00'),
(19, 9, 1, 45.99, '2024-02-19 09:45:00'),
-- Order 20 (Anna Kowalski - second order)
(20, 11, 1, 549.99, '2024-02-20 11:30:00'),
(20, 12, 1, 19.99, '2024-02-20 11:30:00');

-- Insert Payments
INSERT INTO payments (order_id, payment_method, amount, payment_status, paid_at, created_at) VALUES
(1, 'credit_card', 194.97, 'completed', '2024-02-01 10:20:00', '2024-02-01 10:15:00'),
(2, 'paypal', 287.96, 'completed', '2024-02-02 14:35:00', '2024-02-02 14:30:00'),
(3, 'credit_card', 199.96, 'completed', '2024-02-03 09:25:00', '2024-02-03 09:20:00'),
(4, 'credit_card', 489.98, 'completed', '2024-02-04 11:50:00', '2024-02-04 11:45:00'),
(5, 'bank_transfer', 345.98, 'completed', '2024-02-05 13:15:00', '2024-02-05 13:10:00'),
(6, 'credit_card', 569.98, 'completed', '2024-02-06 15:35:00', '2024-02-06 15:30:00'),
(7, 'paypal', 149.97, 'completed', '2024-02-07 10:05:00', '2024-02-07 10:00:00'),
(8, 'credit_card', 379.98, 'completed', '2024-02-08 12:25:00', '2024-02-08 12:20:00'),
(9, 'credit_card', 124.93, 'completed', '2024-02-09 14:50:00', '2024-02-09 14:45:00'),
(10, 'paypal', 445.98, 'completed', '2024-02-10 16:05:00', '2024-02-10 16:00:00'),
(11, 'bank_transfer', 849.98, 'completed', '2024-02-11 09:35:00', '2024-02-11 09:30:00'),
(12, 'credit_card', 364.97, 'completed', '2024-02-12 11:20:00', '2024-02-12 11:15:00'),
(13, 'credit_card', 249.97, 'completed', '2024-02-13 13:45:00', '2024-02-13 13:40:00'),
(14, 'paypal', 445.98, 'completed', '2024-02-14 15:25:00', '2024-02-14 15:20:00'),
(15, 'credit_card', 25.98, 'pending', NULL, '2024-02-15 10:00:00'),
(16, 'credit_card', 379.98, 'completed', '2024-02-16 12:35:00', '2024-02-16 12:30:00'),
(17, 'paypal', 319.98, 'completed', '2024-02-17 14:05:00', '2024-02-17 14:00:00'),
(18, 'credit_card', 144.97, 'completed', '2024-02-18 16:20:00', '2024-02-18 16:15:00'),
(19, 'credit_card', 135.98, 'completed', '2024-02-19 09:50:00', '2024-02-19 09:45:00'),
(20, 'bank_transfer', 569.98, 'completed', '2024-02-20 11:35:00', '2024-02-20 11:30:00');

-- =====================================================
-- Verification Queries (Optional - for testing)
-- =====================================================

-- Uncomment these to verify the data:

-- SELECT 'Users' as table_name, COUNT(*) as row_count FROM users
-- UNION ALL
-- SELECT 'Products', COUNT(*) FROM products
-- UNION ALL
-- SELECT 'Orders', COUNT(*) FROM orders
-- UNION ALL
-- SELECT 'Order Items', COUNT(*) FROM order_items
-- UNION ALL
-- SELECT 'Payments', COUNT(*) FROM payments;

-- Total Revenue Query
-- SELECT 
--     SUM(oi.quantity * oi.price) as total_revenue,
--     COUNT(DISTINCT o.id) as total_orders,
--     COUNT(DISTINCT o.user_id) as total_customers
-- FROM orders o
-- JOIN order_items oi ON o.id = oi.order_id
-- WHERE o.status = 'completed';

-- Orders per Day
-- SELECT 
--     order_date,
--     COUNT(*) as order_count,
--     SUM(oi.quantity * oi.price) as daily_revenue
-- FROM orders o
-- JOIN order_items oi ON o.id = oi.order_id
-- WHERE o.status = 'completed'
-- GROUP BY order_date
-- ORDER BY order_date;

-- Top Products
-- SELECT 
--     p.name,
--     p.category,
--     SUM(oi.quantity) as total_quantity_sold,
--     SUM(oi.quantity * oi.price) as total_revenue
-- FROM products p
-- JOIN order_items oi ON p.id = oi.product_id
-- JOIN orders o ON oi.order_id = o.id
-- WHERE o.status = 'completed'
-- GROUP BY p.id, p.name, p.category
-- ORDER BY total_revenue DESC
-- LIMIT 10;

-- Users by Country
-- SELECT 
--     country,
--     COUNT(*) as user_count,
--     COUNT(DISTINCT o.id) as total_orders,
--     COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue
-- FROM users u
-- LEFT JOIN orders o ON u.id = o.user_id AND o.status = 'completed'
-- LEFT JOIN order_items oi ON o.id = oi.order_id
-- GROUP BY country
-- ORDER BY user_count DESC;

-- =====================================================
-- End of Script
-- =====================================================
