const mysql = require('mysql2');

console.log('🔍 Vérification de la base de données...');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Impossible de se connecter à MySQL:', err.message);
        console.log('💡 Vérifiez que:');
        console.log('   - MySQL est démarré (XAMPP/WAMP)');
        console.log('   - Le service MySQL est actif');
        return;
    }
    console.log('✅ Connecté à MySQL');

    // Vérifier si la base existe
    connection.query('SHOW DATABASES LIKE "warehouse_db"', (err, results) => {
        if (err) {
            console.error('❌ Erreur vérification base:', err.message);
            return;
        }

        if (results.length > 0) {
            console.log('✅ Base warehouse_db existe');
            
            // Vérifier les tables
            connection.query('USE warehouse_db');
            connection.query('SHOW TABLES', (err, tables) => {
                if (err) {
                    console.error('❌ Erreur vérification tables:', err.message);
                    return;
                }
                
                const tableNames = tables.map(t => Object.values(t)[0]);
                console.log('📊 Tables trouvées:', tableNames);
                
                // Compter les enregistrements dans chaque table
                let tablesChecked = 0;
                tableNames.forEach(tableName => {
                    connection.query(`SELECT COUNT(*) as count FROM ${tableName}`, (err, result) => {
                        if (!err) {
                            console.log(`   📋 ${tableName}: ${result[0].count} enregistrements`);
                        }
                        tablesChecked++;
                        
                        if (tablesChecked === tableNames.length) {
                            console.log('\n🎉 Base de données prête!');
                            connection.end();
                        }
                    });
                });
            });
        } else {
            console.log('❌ Base warehouse_db n\'existe pas');
            console.log('💡 Créez-la dans phpMyAdmin: http://localhost/phpmyadmin');
            connection.end();
        }
    });
});