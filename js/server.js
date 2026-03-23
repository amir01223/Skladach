const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Données temporaires en mémoire
let users = [
    { id: 'U1', name: 'أحمد محمود', email: 'ahmed@example.com', phone: '0123456789', role: 'مدير', warehouse_id: 'W1', status: 'نشط' },
    { id: 'U2', name: 'محمد علي', email: 'mohamed@example.com', phone: '0123456790', role: 'مشرف', warehouse_id: 'W2', status: 'نشط' },
    { id: 'U3', name: 'سارة أحمد', email: 'sara@example.com', phone: '0123456791', role: 'موظف', warehouse_id: 'W1', status: 'نشط' }
];

let warehouses = [
    { id: 'W1', name: 'المخزن الرئيسي', location: 'القاهرة', capacity: 1000, manager: 'أحمد محمود', status: 'نشط' },
    { id: 'W2', name: 'المخزن الفرعي', location: 'الجيزة', capacity: 500, manager: 'محمد علي', status: 'نشط' },
    { id: 'W3', name: 'مخزن الإمدادات', location: 'الإسكندرية', capacity: 800, manager: 'سارة أحمد', status: 'نشط' }
];

// Routes pour les utilisateurs
app.get('/api/users', (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : users.length;
    const result = users.slice(0, limit);
    
    res.json({
        success: true,
        data: result,
        message: 'تم جلب المستخدمين بنجاح',
        total: users.length
    });
});

app.get('/api/users/:id', (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'المستخدم غير موجود'
        });
    }
    
    res.json({
        success: true,
        data: user,
        message: 'تم جلب بيانات المستخدم بنجاح'
    });
});

app.post('/api/users', (req, res) => {
    const newUser = {
        id: 'U' + Date.now(),
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        role: req.body.role,
        warehouse_id: req.body.warehouse_id,
        status: req.body.status || 'نشط',
        created_at: new Date().toISOString()
    };
    
    users.push(newUser);
    
    res.json({
        success: true,
        data: newUser,
        message: 'تم إضافة المستخدم بنجاح'
    });
});

app.put('/api/users/:id', (req, res) => {
    const index = users.findIndex(u => u.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: 'المستخدم غير موجود'
        });
    }
    
    users[index] = { ...users[index], ...req.body };
    
    res.json({
        success: true,
        data: users[index],
        message: 'تم تحديث المستخدم بنجاح'
    });
});

app.delete('/api/users/:id', (req, res) => {
    const index = users.findIndex(u => u.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: 'المستخدم غير موجود'
        });
    }
    
    const deletedUser = users.splice(index, 1)[0];
    
    res.json({
        success: true,
        data: deletedUser,
        message: 'تم حذف المستخدم بنجاح'
    });
});

// Routes pour les مخازن
app.get('/api/warehouses', (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : warehouses.length;
    const result = warehouses.slice(0, limit);
    
    res.json({
        success: true,
        data: result,
        message: 'تم جلب المخازن بنجاح',
        total: warehouses.length
    });
});

app.post('/api/warehouses', (req, res) => {
    const newWarehouse = {
        id: 'W' + Date.now(),
        name: req.body.name,
        location: req.body.location,
        capacity: req.body.capacity,
        manager: req.body.manager,
        status: req.body.status || 'نشط',
        created_at: new Date().toISOString()
    };
    
    warehouses.push(newWarehouse);
    
    res.json({
        success: true,
        data: newWarehouse,
        message: 'تم إضافة المخزن بنجاح'
    });
});

// Route de test
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'الخادم يعمل بشكل طبيعي',
        timestamp: new Date().toISOString()
    });
});

// Route 404 pour les API غير موجودة
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'الرابط غير موجود'
    });
});

// Démarrage du serveur
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📦 API endpoints:`);
    console.log(`   GET  http://localhost:${PORT}/api/users`);
    console.log(`   POST http://localhost:${PORT}/api/users`);
    console.log(`   GET  http://localhost:${PORT}/api/warehouses`);
    console.log(`   GET  http://localhost:${PORT}/api/health`);
});

module.exports = app;