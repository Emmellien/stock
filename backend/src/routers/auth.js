const express= require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post('/register',async(req,res)=>{
    const { username, password} = req.body;
    const hashPass = await bcrypt.hash(password,10)
    try {
        await db.query('INSERT INTO users(username,password) Values( ?,?)',[username,hashPass]);
        res.status(201).json({message: "User Successfull inserted"});
    } catch (err) {
        res.status(500).json(err)
    }
});

router.post('/login',async(req,res)=>{
    const { username, password} = req.body;
    
    try {
        const [user] = await db.query('select * from users where username = ?',[username]);
       if(user.length > 0 && await bcrypt.compare(password,user[0].password)){
            const token = jwt.sign({ id: user[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token, username: user[0].username, user_id: user[0].user_id });
       } else{
        res.status(401).json({ message: "Invalid credentials" });
       }
       
    } catch (err) {
        res.status(500).json(err)
    }
});

module.exports = router