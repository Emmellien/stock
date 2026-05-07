const express= require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
require('dotenv').config();
const router = express.Router();


router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products ORDER BY product_id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/add',async(req,res)=>{
    const { product_name, price, quantity} = req.body;
    
    try {
        await db.query('INSERT INTO products(product_name,price,quantity) Values( ?,?,?)',[product_name,price,quantity]);
        res.status(201).json({message: "Product Successfull inserted"});
    } catch (err) {
        res.status(500).json(err)
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM products WHERE product_id = ?', [req.params.id]);
        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



module.exports = router