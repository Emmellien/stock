const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. GET all Stock In records (with Product Names)
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT si.*, p.product_name, u.username 
            FROM stock_in si
            JOIN products p ON si.product_id = p.product_id
            JOIN users u ON si.user_id = u.user_id
            ORDER BY si.date_in DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. POST (Add) Stock In and Update Product Quantity
router.post('/add', async (req, res) => {
    const { product_id, quantity_in, date_in, user_id } = req.body;

    // Start a Transaction
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // A. Insert into stock_in table
        await connection.query(
            'INSERT INTO stock_in (product_id, quantity_in, date_in, user_id) VALUES (?, ?, ?, ?)',
            [product_id, quantity_in, date_in, user_id]
        );

        // B. Update the products table quantity
        await connection.query(
            'UPDATE products SET quantity = quantity + ? WHERE product_id = ?',
            [quantity_in, product_id]
        );

        // Commit changes
        await connection.commit();
        res.status(201).json({ message: "Stock updated successfully!" });

    } catch (err) {
        // Rollback changes if anything fails
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

module.exports = router;