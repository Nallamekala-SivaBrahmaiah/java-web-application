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

// Initialize sample products (20 per category)
app.post('/api/init-products', async (req, res) => {
    try {
        const sampleProducts = [
            // Laptops (20)
            { productId: 'laptop1', name: 'MSI Katana 15', category: 'laptops', price: 129999, features: ['Intel i7-13700H', 'RTX 4060', '16GB DDR5'] },
            { productId: 'laptop2', name: 'Apple MacBook Air M2', category: 'laptops', price: 119999, features: ['Apple M2 Chip', '13.6" Retina', '18hr Battery'] },
            { productId: 'laptop3', name: 'ASUS ROG Strix G16', category: 'laptops', price: 149999, features: ['Intel i9-13980HX', 'RTX 4070', '32GB DDR5'] },
            { productId: 'laptop4', name: 'Dell XPS 15 9530', category: 'laptops', price: 229999, features: ['Intel i9-13900H', '15.6" OLED', '32GB RAM'] },
            { productId: 'laptop5', name: 'Lenovo Yoga 9i', category: 'laptops', price: 139999, features: ['Intel i7-1360P', '14" OLED Touch', 'Active Pen'] },
            { productId: 'laptop6', name: 'Acer Swift 3', category: 'laptops', price: 59999, features: ['AMD Ryzen 7', '14" FHD', '12hr Battery'] },
            { productId: 'laptop7', name: 'Microsoft Surface Laptop Studio 2', category: 'laptops', price: 249999, features: ['Intel i7-13800H', 'RTX 4060', '14.4" Touch'] },
            { productId: 'laptop8', name: 'HP OMEN 16', category: 'laptops', price: 159999, features: ['AMD Ryzen 9', 'RTX 4070', '16GB DDR5'] },
            { productId: 'laptop9', name: 'LG Gram 17', category: 'laptops', price: 179999, features: ['Intel i7-1360P', '1.3kg Ultra Light', '19hr Battery'] },
            { productId: 'laptop10', name: 'Apple MacBook Pro 16 M3 Max', category: 'laptops', price: 399999, features: ['Apple M3 Max', '48GB RAM', '16" Liquid Retina'] },
            { productId: 'laptop11', name: 'ASUS Vivobook 15', category: 'laptops', price: 49999, features: ['Intel i5-1235U', '16GB RAM', '15.6" FHD'] },
            { productId: 'laptop12', name: 'Alienware m18', category: 'laptops', price: 349999, features: ['Intel i9-13980HX', 'RTX 4090', '64GB RAM'] },
            { productId: 'laptop13', name: 'HP Spectre x360 14', category: 'laptops', price: 169999, features: ['Intel i7-1355U', '14" OLED Touch', 'HP Pen'] },
            { productId: 'laptop14', name: 'Panasonic Toughbook 55', category: 'laptops', price: 299999, features: ['Intel i7-1185G7', 'MIL-STD-810H', 'Water Resistant'] },
            { productId: 'laptop15', name: 'Google Pixelbook Go', category: 'laptops', price: 89999, features: ['Intel i5-1135G7', '13.3" FHD Touch', '12hr Battery'] },
            { productId: 'laptop16', name: 'Razer Blade 16', category: 'laptops', price: 379999, features: ['Intel i9-13950HX', 'RTX 4080', 'Dual-mode Mini-LED'] },
            { productId: 'laptop17', name: 'Acer Aspire Vero', category: 'laptops', price: 59999, features: ['Intel i5-1235U', 'Recycled Materials', '10hr Battery'] },
            { productId: 'laptop18', name: 'GPD Win Max 2', category: 'laptops', price: 129999, features: ['AMD Ryzen 7 6800U', 'Radeon 680M', '10.1" Touch'] },
            { productId: 'laptop19', name: 'Lenovo ThinkPad X1 Carbon', category: 'laptops', price: 199999, features: ['Intel i7-1365U', 'vPro Security', '1.1kg Carbon'] },
            { productId: 'laptop20', name: 'Gigabyte Aorus 17X', category: 'laptops', price: 299999, features: ['Intel i9-13980HX', 'RTX 4090', '32GB DDR5'] },
            
            // Phones (20)
            { productId: 'phone1', name: 'iPhone 15 Pro Max', category: 'phones', price: 159999, features: ['A17 Pro', '48MP Camera', '6.7" Display'] },
            { productId: 'phone2', name: 'Samsung Galaxy S24 Ultra', category: 'phones', price: 134999, features: ['Snapdragon 8 Gen 3', '200MP Camera', 'S Pen'] },
            { productId: 'phone3', name: 'Samsung Galaxy Z Fold5', category: 'phones', price: 154999, features: ['Snapdragon 8 Gen 2', '7.6" Foldable', 'S Pen Support'] },
            { productId: 'phone4', name: 'OnePlus Open', category: 'phones', price: 139999, features: ['Snapdragon 8 Gen 2', 'Hasselblad Camera', '7.82" Flexion'] },
            { productId: 'phone5', name: 'Google Pixel 8 Pro', category: 'phones', price: 106999, features: ['Google Tensor G3', '50MP Camera', 'Temperature Sensor'] },
            { productId: 'phone6', name: 'ASUS ROG Phone 7 Ultimate', category: 'phones', price: 94999, features: ['Snapdragon 8 Gen 2', 'AirTrigger 7', 'Active Cooler'] },
            { productId: 'phone7', name: 'Nothing Phone (2)', category: 'phones', price: 44999, features: ['Snapdragon 8+ Gen 1', 'Glyph Interface', '6.7" OLED'] },
            { productId: 'phone8', name: 'ASUS Zenfone 10', category: 'phones', price: 49999, features: ['Snapdragon 8 Gen 2', '5.9" AMOLED', '50MP Gimbal'] },
            { productId: 'phone9', name: 'Xiaomi 13 Ultra', category: 'phones', price: 89999, features: ['Snapdragon 8 Gen 2', 'Leica Quad Camera', '6.7" AMOLED'] },
            { productId: 'phone10', name: 'Samsung Galaxy A54 5G', category: 'phones', price: 29999, features: ['Exynos 1380', '50MP Camera', '5000mAh'] },
            { productId: 'phone11', name: 'OnePlus 11R', category: 'phones', price: 39999, features: ['Snapdragon 8+ Gen 1', '100W Charging', '6.7" AMOLED'] },
            { productId: 'phone12', name: 'vivo X100 Pro', category: 'phones', price: 89999, features: ['Dimensity 9300', 'Zeiss Quad Camera', '8K Video'] },
            { productId: 'phone13', name: 'Motorola Razr 40 Ultra', category: 'phones', price: 89999, features: ['Snapdragon 8+ Gen 1', '6.9" Foldable', '3.6" Cover'] },
            { productId: 'phone14', name: 'nubia Red Magic 9 Pro', category: 'phones', price: 64999, features: ['Snapdragon 8 Gen 3', 'Active Cooling', '165W Charging'] },
            { productId: 'phone15', name: 'Fairphone 5', category: 'phones', price: 49999, features: ['QCM6490', 'Modular Design', 'Ethical Materials'] },
            { productId: 'phone16', name: 'iQOO Neo 7 Pro', category: 'phones', price: 34999, features: ['Snapdragon 8+ Gen 1', '120W Charging', '6.78" AMOLED'] },
            { productId: 'phone17', name: 'Sony Xperia 1 V', category: 'phones', price: 119999, features: ['Snapdragon 8 Gen 2', '4K HDR Camera', '4K OLED 21:9'] },
            { productId: 'phone18', name: 'Ulefone Armor 23 Ultra', category: 'phones', price: 49999, features: ['Dimensity 8020', 'IP68/IP69K', 'Thermal Camera'] },
            { productId: 'phone19', name: 'Huawei P60 Pro', category: 'phones', price: 89999, features: ['Snapdragon 8+ Gen 1', 'XMAGE Camera', '6.67" OLED'] },
            { productId: 'phone20', name: 'Oppo Find X7 Ultra', category: 'phones', price: 99999, features: ['Snapdragon 8 Gen 3', 'Hasselblad Quad', '6.82" AMOLED'] },
            
            // Watches (20)
            { productId: 'watch1', name: 'Apple Watch Series 9', category: 'watches', price: 41900, features: ['Blood Oxygen', 'S9 Chip', '18hr Battery'] },
            { productId: 'watch2', name: 'Samsung Galaxy Watch6 Classic', category: 'watches', price: 36999, features: ['ECG Monitor', '47mm Display', '2GB RAM'] },
            { productId: 'watch3', name: 'Garmin Forerunner 965', category: 'watches', price: 59999, features: ['GPS Maps', 'Running Metrics', '23-day Battery'] },
            { productId: 'watch4', name: 'Garmin MARQ Athlete', category: 'watches', price: 129999, features: ['Titanium Bezel', 'Advanced Metrics', 'Topo Maps'] },
            { productId: 'watch5', name: 'Fitbit Sense 2', category: 'watches', price: 24999, features: ['ECG App', 'EDA Scan', '6+ Day Battery'] },
            { productId: 'watch6', name: 'Apple Watch Ultra 2', category: 'watches', price: 89900, features: ['Depth Gauge', '40mm Titanium', '36hr Battery'] },
            { productId: 'watch7', name: 'Fossil Gen 6', category: 'watches', price: 19999, features: ['Snapdragon 4100+', 'Heart Rate', 'Google Pay'] },
            { productId: 'watch8', name: 'Withings ScanWatch', category: 'watches', price: 29999, features: ['ECG Monitoring', 'Sleep Apnea', '30-day Battery'] },
            { productId: 'watch9', name: 'Garmin Descent MK3', category: 'watches', price: 149999, features: ['Dive Computer', '3-Axis Compass', '30hr Dive'] },
            { productId: 'watch10', name: 'Polar Grit X Pro', category: 'watches', price: 44999, features: ['Altitude/Battery', 'Orthostatic Test', '40hr GPS'] },
            { productId: 'watch11', name: 'Garmin Bounce', category: 'watches', price: 14999, features: ['LTE Connectivity', 'GPS Tracking', 'Activity Games'] },
            { productId: 'watch12', name: 'Fossil Hybrid HR', category: 'watches', price: 16999, features: ['Analog Hands', 'Heart Rate', '2 Week Battery'] },
            { productId: 'watch13', name: 'Apple Watch SE 2', category: 'watches', price: 29900, features: ['Heart Rate', 'Swimproof', '18hr Battery'] },
            { productId: 'watch14', name: 'Google Pixel Watch 2', category: 'watches', price: 34999, features: ['Fitbit Integration', 'Always-on Display', '24hr Battery'] },
            { productId: 'watch15', name: 'Coros Pace 3', category: 'watches', price: 24999, features: ['Running Metrics', 'GPS/GLONASS', '24hr GPS'] },
            { productId: 'watch16', name: 'Tag Heuer Connected', category: 'watches', price: 199999, features: ['Titanium Case', 'Snapdragon 4100+', 'Health Tracking'] },
            { productId: 'watch17', name: 'Whoop 4.0', category: 'watches', price: 24999, features: ['Strain Coach', 'Sleep Tracking', '5-day Battery'] },
            { productId: 'watch18', name: 'Suunto 9 Peak Pro', category: 'watches', price: 54999, features: ['Barometer', 'GPS/GLONASS', '40hr Battery'] },
            { productId: 'watch19', name: 'Michael Kors Gen 6', category: 'watches', price: 22999, features: ['Snapdragon 4100+', 'Heart Rate', 'Google Pay'] },
            { productId: 'watch20', name: 'Garmin Fenix 7 Pro', category: 'watches', price: 79999, features: ['Solar Charging', 'TopoActive Maps', 'Music Storage'] }
        ];
        
        await Product.deleteMany({});
        await Product.insertMany(sampleProducts);
        
        res.json({ message: '60 sample products initialized successfully (20 per category)' });
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
