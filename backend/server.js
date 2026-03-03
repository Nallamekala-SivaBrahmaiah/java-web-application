const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/lakeflipmart';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Order Schema
const orderSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    productCategory: { type: String, required: true },
    price: { type: Number, required: true },
    customerName: { type: String, default: 'Guest' },
    customerEmail: { type: String, default: 'guest@example.com' },
    quantity: { type: Number, default: 1 },
    orderDate: { type: Date, default: Date.now },
    status: { type: String, default: 'pending' }
});

const Order = mongoose.model('Order', orderSchema);

// Product Schema (for storing product data)
const productSchema = new mongoose.Schema({
    productId: { type: String, unique: true },
    name: String,
    category: String,
    price: Number,
    description: String,
    features: [String],
    inStock: { type: Number, default: 10 }
});

const Product = mongoose.model('Product', productSchema);

// API Routes

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get products by category
app.get('/api/products/:category', async (req, res) => {
    try {
        const products = await Product.find({ category: req.params.category });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Place an order
app.post('/api/orders', async (req, res) => {
    try {
        const { productId, productName, productCategory, price, customerName, customerEmail, quantity } = req.body;
        
        const order = new Order({
            productId,
            productName,
            productCategory,
            price,
            customerName: customerName || 'Guest',
            customerEmail: customerEmail || 'guest@example.com',
            quantity: quantity || 1
        });
        
        await order.save();
        
        res.status(201).json({ 
            message: 'Order placed successfully!', 
            orderId: order._id,
            order 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all orders
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ orderDate: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get order by ID
app.get('/api/orders/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update order status
app.patch('/api/orders/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true }
        );
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Initialize some sample products
app.post('/api/init-products', async (req, res) => {
    try {
        const sampleProducts = [
            // Laptops
            { productId: 'laptop1', name: 'MSI Katana 15', category: 'laptops', price: 129999, features: ['Intel i7', 'RTX 4060', '16GB RAM'] },
            { productId: 'laptop2', name: 'MacBook Air M2', category: 'laptops', price: 119999, features: ['Apple M2', '13.6" Retina', '18hr Battery'] },
            { productId: 'laptop3', name: 'HP Spectre x360', category: 'laptops', price: 149999, features: ['Intel i7', 'OLED Touch', '16hr Battery'] },
            
            // Phones
            { productId: 'phone1', name: 'iPhone 15 Pro Max', category: 'phones', price: 159999, features: ['A17 Pro', '48MP Camera', '6.7" Display'] },
            { productId: 'phone2', name: 'Samsung Galaxy S24 Ultra', category: 'phones', price: 134999, features: ['Snapdragon 8 Gen 3', '200MP Camera', 'S Pen'] },
            { productId: 'phone3', name: 'OnePlus Open', category: 'phones', price: 139999, features: ['Foldable Display', 'Snapdragon 8 Gen 2', '48MP Camera'] },
            
            // Watches
            { productId: 'watch1', name: 'Apple Watch Series 9', category: 'watches', price: 41900, features: ['Blood Oxygen', 'S9 Chip', '18hr Battery'] },
            { productId: 'watch2', name: 'Samsung Galaxy Watch6', category: 'watches', price: 36999, features: ['ECG Monitor', '47mm Display', '2GB RAM'] },
            { productId: 'watch3', name: 'Garmin Forerunner 965', category: 'watches', price: 59999, features: ['GPS Maps', 'Running Metrics', '23-day Battery'] }
        ];
        
        await Product.deleteMany({});
        await Product.insertMany(sampleProducts);
        
        res.json({ message: 'Sample products initialized successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
