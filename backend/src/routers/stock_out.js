const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. GET all Stock Out records
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT so.*, p.product_name, u.username 
            FROM stock_out so
            JOIN products p ON so.product_id = p.product_id
            JOIN users u ON so.user_id = u.user_id
            ORDER BY so.date_out DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. POST (Add) Stock Out with Validation
router.post('/add', async (req, res) => {
    const { product_id, quantity_out, date_out, user_id } = req.body;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // A. Check current stock level
        const [product] = await connection.query(
            'SELECT quantity FROM products WHERE product_id = ?', 
            [product_id]
        );

        if (product.length === 0) {
            throw new Error("Product not found");
        }

        if (product[0].quantity < quantity_out) {
            return res.status(400).json({ message: `Insufficient stock! Current balance: ${product[0].quantity}` });
        }

        // B. Insert into stock_out table
        await connection.query(
            'INSERT INTO stock_out (product_id, quantity_out, date_out, user_id) VALUES (?, ?, ?, ?)',
            [product_id, quantity_out, date_out, user_id]
        );

        // C. Decrease the products table quantity
        await connection.query(
            'UPDATE products SET quantity = quantity - ? WHERE product_id = ?',
            [quantity_out, product_id]
        );

        await connection.commit();
        res.status(201).json({ message: "Stock removed successfully!" });

    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

module.exports = router;