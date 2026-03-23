const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
//translation: const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));
app.use('/js', express.static('js'));

// Connexion MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'warehouse_db'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Erreur MySQL:', err.message);
        return;
    }
    console.log('✅ Connecté à MySQL');
});

// Route de test
app.get('/api/test', (req, res) => {
    res.json({ 
        message: '🚀 Serveur fonctionne!', 
        timestamp: new Date()
    });
});

// Route pour les produits
app.get('/api/products', (req, res) => {
    const sql = `SELECT p.*, w.name as warehouse_name, c.name as category_name 
                FROM products p 
                LEFT JOIN warehouses w ON p.warehouse_id = w.code
                LEFT JOIN categories c ON p.category = c.name
                ORDER BY p.name`;
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: results });
    });
});

app.post('/api/products', (req, res) => {
    const { name, code, barcode, category, unit, price, cost, reorder_level, expiry_date, warehouse_id, current_stock } = req.body;
    
    const id = 'P' + Date.now();
    const status = current_stock <= reorder_level ? 'نفد تقريباً' : 'متوفر';
    
    const sql = `INSERT INTO products (id, name, code, barcode, category, unit, price, cost, reorder_level, expiry_date, warehouse_id, current_stock, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [id, name, code, barcode, category, unit, price, cost, reorder_level, expiry_date, warehouse_id, current_stock, status], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true, id: id, message: '✅ Produit ajouté' });
    });
});

app.put('/api/products/:id', (req, res) => {
    const { name, code, barcode, category, unit, price, cost, reorder_level, expiry_date, warehouse_id, current_stock } = req.body;
    
    const status = current_stock <= reorder_level ? 'نفد تقريباً' : 'متوفر';
    
    const sql = `UPDATE products 
                SET name = ?, code = ?, barcode = ?, category = ?, unit = ?, price = ?, cost = ?, reorder_level = ?, expiry_date = ?, warehouse_id = ?, current_stock = ?, status = ?
                WHERE id = ?`;
    
    db.query(sql, [name, code, barcode, category, unit, price, cost, reorder_level, expiry_date, warehouse_id, current_stock, status, req.params.id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true, message: '✅ Produit modifié' });
    });
});

app.delete('/api/products/:id', (req, res) => {
    const sql = 'DELETE FROM products WHERE id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true, message: '🗑️ Produit supprimé' });
    });
});

// Route pour les catégories
app.get('/api/categories', (req, res) => {
    const sql = 'SELECT * FROM categories ORDER BY name';
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: results });
    });
});

app.post('/api/categories', (req, res) => {
    const { name, description } = req.body;
    const sql = 'INSERT INTO categories (name, description) VALUES (?, ?)';
    db.query(sql, [name, description], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true, message: '✅ Catégorie ajoutée' });
    });
});

// Route pour les entrepôts
app.get('/api/warehouses', (req, res) => {
    const sql = 'SELECT * FROM warehouses ORDER BY name';
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: results });
    });
});

app.post('/api/warehouses', (req, res) => {
    const { code, name, location, capacity } = req.body;
    const sql = 'INSERT INTO warehouses (code, name, location, capacity) VALUES (?, ?, ?, ?)';
    db.query(sql, [code, name, location, capacity], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true, message: '✅ Entrepôt ajouté' });
    });
});

// Route pour les transactions
app.get('/api/transactions', (req, res) => {
    const sql = `SELECT t.*, p.name as product_name, w.name as warehouse_name, u.name as user_name 
                FROM transactions t 
                LEFT JOIN products p ON t.product_id = p.id 
                LEFT JOIN warehouses w ON t.warehouse_id = w.code
                LEFT JOIN users u ON t.user_id = u.id
                ORDER BY t.created_at DESC`;
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: results });
    });
});

app.post('/api/transactions', (req, res) => {
    const { product_id, warehouse_id, type, quantity, user_id, notes } = req.body;
    
    const sql = `INSERT INTO transactions (product_id, warehouse_id, type, quantity, user_id, notes) 
                VALUES (?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [product_id, warehouse_id, type, quantity, user_id, notes], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Mettre à jour le stock du produit
        const updateSql = `UPDATE products 
                        SET current_stock = current_stock + ? 
                        WHERE id = ?`;
        const stockChange = type === 'IN' ? quantity : -quantity;
        
        db.query(updateSql, [stockChange, product_id], (err, updateResult) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ success: true, message: '✅ Transaction enregistrée' });
        });
    });
});

// Route pour les statistiques du dashboard
app.get('/api/dashboard/stats', (req, res) => {
    const stats = {};
    
    // Nombre total de produits
    const productsSql = 'SELECT COUNT(*) as total FROM products';
    db.query(productsSql, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        stats.totalProducts = results[0].total;
        
        // Produits en rupture de stock
        const lowStockSql = `SELECT COUNT(*) as lowStock FROM products 
                            WHERE current_stock <= reorder_level`;
        db.query(lowStockSql, (err, results) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            stats.lowStockProducts = results[0].lowStock;
            
            // Valeur totale de l'inventaire
            const valueSql = `SELECT SUM(price * current_stock) as totalValue 
                             FROM products WHERE current_stock > 0`;
            db.query(valueSql, (err, results) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                stats.totalValue = results[0].totalValue || 0;
                
                // Transactions aujourd'hui
                const today = new Date().toISOString().split('T')[0];
                const transactionsSql = `SELECT COUNT(*) as todayTransactions 
                                        FROM transactions 
                                        WHERE DATE(created_at) = ?`;
                db.query(transactionsSql, [today], (err, results) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    stats.todayTransactions = results[0].todayTransactions;
                    
                    res.json({ data: stats });
                });
            });
        });
    });
});

// Servir les pages HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/inventory', (req, res) => {
    res.sendFile(path.join(__dirname, 'inventory.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/reports', (req, res) => {
    res.sendFile(path.join(__dirname, 'reports.html'));
});

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`📍 Serveur: http://localhost:${PORT}`);
    console.log('✅ Prêt à recevoir des requêtes!');
});