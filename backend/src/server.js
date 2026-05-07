const express = require('express');
const db = require('./config/db')
const cors =require("cors");
require('dotenv').config();

const authRouter= require('./routers/auth');
const productRouter= require('./routers/products')
const stockinRouter = require('./routers/stock_in')
const stockoutRouter = require('./routers/stock_out')
const reportRouter = require('./routers/reports')
  
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/auth', authRouter);
app.use('/api/product', productRouter);
app.use('/api/stock-in' , stockinRouter)
app.use('/api/stock-out' , stockoutRouter)
app.use('/api/reports', reportRouter)

app.get('/', (req,res) =>{
    res.json({message: "hello boys"})
})

const PORT = process.env.PORT;

app.listen(PORT, ()=> {
    console.log(`http://localhost:${PORT}`)
});
