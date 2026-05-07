const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/summary', async (req, res) => {
    try {
        // 1. Total Inventory Value and Item Count
        // Use COALESCE to return 0 instead of NULL for empty tables
        const [summary] = await db.query(`
            SELECT 
                COUNT(*) as total_items, 
                COALESCE(SUM(quantity * price), 0) as total_value,
                COALESCE(SUM(quantity), 0) as total_quantity
            FROM products
        `);

        // 2. Products with Low Stock
        const [lowStock] = await db.query(`
            SELECT product_name, quantity 
            FROM products 
            WHERE quantity < 10
            ORDER BY quantity ASC
        `);

        // 3. Movement Summary (Total In vs Total Out)
        // Added COALESCE here because if stock_in is empty, SUM returns NULL
        const [movements] = await db.query(`
            SELECT 
                (SELECT COALESCE(SUM(quantity_in), 0) FROM stock_in) as total_in,
                (SELECT COALESCE(SUM(quantity_out), 0) FROM stock_out) as total_out
        `);

        res.json({
            summary: summary[0] || { total_items: 0, total_value: 0, total_quantity: 0 },
            lowStock: lowStock || [],
            movements: movements[0] || { total_in: 0, total_out: 0 }
        });
    } catch (err) {
        console.error("SQL Error in /summary:", err); // This helps you see the error in the terminal
        res.status(500).json({ error: err.message });
    }
});

// GET /api/reports/full-inventory
router.get('/full-inventory', async (req, res) => {
    try {
        const [report] = await db.query(`
            SELECT 
                product_id,
                product_name,
                quantity,
                price,
                (quantity * price) as inventory_value,
                CASE 
                    WHEN quantity <= 0 THEN 'Out of Stock'
                    WHEN quantity < 10 THEN 'Low Stock'
                    ELSE 'Healthy'
                END as stock_status
            FROM products
            ORDER BY inventory_value DESC
        `);

        res.json(report);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;