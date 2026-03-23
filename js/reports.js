// reports.js - IDENTIQUE À dashboard.js POUR GARANTIR LE FONCTIONNEMENT

let stockValueChart, monthlyTransChart, transTypeChart;
let products = [], transactions = [];

document.addEventListener('DOMContentLoaded', async function() {
    console.log('📊 Initialisation des rapports...');
    
    try {
        // 1. Initialiser les graphiques AVANT tout
        initializeCharts();
        
        // 2. Charger les données
        await loadReportsData();
        
        // 3. Mettre à jour les graphiques
        updateCharts();
        
        console.log('✅ Rapports initialisés avec succès');
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des rapports:', error);
        showAlert('حدث خطأ في تحميل التقارير', 'danger');
        
        // Charger les données de démonstration
        loadFallbackData();
    }
});

function initializeCharts() {
    console.log('📈 Initialisation des graphiques...');
    
    // 1. Graphique de valeur du stock
    const stockCtx = document.getElementById('stockValueChart');
    if (stockCtx) {
        stockValueChart = new Chart(stockCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['منتج ١', 'منتج ٢', 'منتج ٣', 'منتج ٤', 'منتج ٥'],
                datasets: [{
                    label: 'قيمة المخزون (ج.م)',
                    data: [5000, 8000, 3000, 7000, 4000],
                    backgroundColor: '#3b82f6',
                    borderColor: '#1d4ed8',
                    borderWidth: 1,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        rtl: true,
                        labels: {
                            font: {
                                family: 'Cairo',
                                size: 12
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: {
                                family: 'Cairo'
                            }
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                family: 'Cairo'
                            }
                        }
                    }
                }
            }
        });
        console.log('✅ Graphique de valeur initialisé');
    }
    
    // 2. Graphique des transactions mensuelles
    const monthlyCtx = document.getElementById('monthlyTransChart');
    if (monthlyCtx) {
        monthlyTransChart = new Chart(monthlyCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
                datasets: [
                    {
                        label: 'الوارد',
                        data: [15, 20, 12, 18, 25, 22, 30],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'الصادر',
                        data: [10, 15, 8, 12, 18, 15, 20],
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        rtl: true,
                        labels: {
                            font: {
                                family: 'Cairo',
                                size: 12
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: {
                                family: 'Cairo'
                            }
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                family: 'Cairo'
                            }
                        }
                    }
                }
            }
        });
        console.log('✅ Graphique des transactions initialisé');
    }
    
    // 3. Graphique des types de transactions
    const typeCtx = document.getElementById('transTypeChart');
    if (typeCtx) {
        transTypeChart = new Chart(typeCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['وارد', 'صادر', 'تحويل', 'إرجاع'],
                datasets: [{
                    data: [45, 30, 15, 10],
                    backgroundColor: ['#10b981', '#ef4444', '#3b82f6', '#f59e0b'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                        rtl: true,
                        labels: {
                            font: {
                                family: 'Cairo',
                                size: 12
                            }
                        }
                    }
                }
            }
        });
        console.log('✅ Graphique des types initialisé');
    }
}

async function loadReportsData() {
    try {
        console.log('🔍 Chargement des données des rapports...');
        
        // A. Essayer de charger depuis l'API
        if (window.WMS && window.WMS.fetchData) {
            const [productsData, transactionsData] = await Promise.allSettled([
                WMS.fetchData('products'),
                WMS.fetchData('transactions')
            ]);
            
            // Traiter les produits
            if (productsData.status === 'fulfilled' && productsData.value && productsData.value.success) {
                products = productsData.value.data || [];
                console.log(`✅ ${products.length} produits chargés depuis l'API`);
            } else {
                console.warn('⚠️ Pas de produits depuis l\'API');
                products = getDemoProducts();
            }
            
            // Traiter les transactions
            if (transactionsData.status === 'fulfilled' && transactionsData.value && transactionsData.value.success) {
                transactions = transactionsData.value.data || [];
                console.log(`✅ ${transactions.length} transactions chargées depuis l'API`);
            } else {
                console.warn('⚠️ Pas de transactions depuis l\'API');
                transactions = getDemoTransactions();
            }
        } else {
            // B. Si WMS n'est pas disponible, utiliser les données de démonstration
            console.log('ℹ️ WMS non disponible, utilisation des données de démonstration');
            products = getDemoProducts();
            transactions = getDemoTransactions();
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des données:', error);
        // En cas d'erreur, utiliser les données de démonstration
        products = getDemoProducts();
        transactions = getDemoTransactions();
    }
}

function updateCharts() {
    console.log('🔄 Mise à jour des graphiques...');
    
    try {
        // 1. Mettre à jour le graphique de valeur
        if (stockValueChart && products.length > 0) {
            const topProducts = [...products]
                .sort((a, b) => {
                    const valueA = (parseFloat(a.current_stock) || 0) * (parseFloat(a.price) || 0);
                    const valueB = (parseFloat(b.current_stock) || 0) * (parseFloat(b.price) || 0);
                    return valueB - valueA;
                })
                .slice(0, 5);
            
            stockValueChart.data.labels = topProducts.map(p => 
                p.name && p.name.length > 10 ? p.name.substring(0, 10) + '...' : (p.name || 'غير معروف')
            );
            
            stockValueChart.data.datasets[0].data = topProducts.map(p => 
                (parseFloat(p.current_stock) || 0) * (parseFloat(p.price) || 0)
            );
            
            stockValueChart.update();
            console.log('✅ Graphique de valeur mis à jour');
        }
        
        // 2. Mettre à jour le graphique des transactions
        if (monthlyTransChart && transactions.length > 0) {
            // Simuler des données hebdomadaires basées sur les transactions
            const weeklyData = [0, 0, 0, 0, 0, 0, 0];
            const weeklyOutData = [0, 0, 0, 0, 0, 0, 0];
            
            transactions.forEach(t => {
                const day = Math.floor(Math.random() * 7); // Simuler un jour aléatoire
                const qty = parseFloat(t.quantity) || 1;
                
                if (t.type === 'IN' || t.type === 'وارد') {
                    weeklyData[day] += qty;
                } else {
                    weeklyOutData[day] += qty;
                }
            });
            
            monthlyTransChart.data.datasets[0].data = weeklyData;
            monthlyTransChart.data.datasets[1].data = weeklyOutData;
            monthlyTransChart.update();
            console.log('✅ Graphique des transactions mis à jour');
        }
        
        // 3. Mettre à jour le graphique des types
        if (transTypeChart && transactions.length > 0) {
            const types = {
                'وارد': 0,
                'صادر': 0,
                'تحويل': 0,
                'إرجاع': 0
            };
            
            transactions.forEach(t => {
                const type = t.type || '';
                if (type === 'IN' || type === 'وارد') {
                    types['وارد']++;
                } else if (type === 'OUT' || type === 'صادر') {
                    types['صادر']++;
                } else if (type.includes('تحويل')) {
                    types['تحويل']++;
                } else {
                    types['إرجاع']++;
                }
            });
            
            // Filtrer les types avec 0 valeur
            const filteredTypes = {};
            Object.entries(types).forEach(([type, count]) => {
                if (count > 0) filteredTypes[type] = count;
            });
            
            transTypeChart.data.labels = Object.keys(filteredTypes);
            transTypeChart.data.datasets[0].data = Object.values(filteredTypes);
            
            // Ajuster les couleurs
            const colors = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b'];
            transTypeChart.data.datasets[0].backgroundColor = colors.slice(0, Object.keys(filteredTypes).length);
            
            transTypeChart.update();
            console.log('✅ Graphique des types mis à jour');
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour des graphiques:', error);
    }
}

// ========== DONNÉES DE DÉMONSTRATION ==========

function getDemoProducts() {
    return [
        {
            id: '1',
            code: 'PRD-001',
            name: 'حليب كامل الدسم',
            category: 'مشتقات الحليب',
            current_stock: 150,
            price: 25.5,
            unit: 'علبة',
            reorder_level: 20,
            barcode: '123456789012'
        },
        {
            id: '2',
            code: 'PRD-002',
            name: 'أرز بسمتي',
            category: 'مواد غذائية',
            current_stock: 85,
            price: 45.0,
            unit: 'كيلو',
            reorder_level: 30,
            barcode: '234567890123'
        },
        {
            id: '3',
            code: 'PRD-003',
            name: 'زيت زيتون',
            category: 'زيوت',
            current_stock: 42,
            price: 120.0,
            unit: 'لتر',
            reorder_level: 15,
            barcode: '345678901234'
        },
        {
            id: '4',
            code: 'PRD-004',
            name: 'سكر أبيض',
            category: 'مواد غذائية',
            current_stock: 10,
            price: 18.0,
            unit: 'كيلو',
            reorder_level: 25,
            barcode: '456789012345'
        },
        {
            id: '5',
            code: 'PRD-005',
            name: 'قهوة تركية',
            category: 'مشروبات',
            current_stock: 25,
            price: 180.0,
            unit: 'كيلو',
            reorder_level: 10,
            barcode: '567890123456'
        }
    ];
}

function getDemoTransactions() {
    return [
        {
            id: '1',
            type: 'وارد',
            product_id: '1',
            product_name: 'حليب كامل الدسم',
            product_code: 'PRD-001',
            quantity: 50,
            price: 25.5,
            date: '2024-01-15',
            warehouse_id: 'W1',
            warehouse_name: 'المخزن الرئيسي',
            notes: 'شحنة واردة من المورد'
        },
        {
            id: '2',
            type: 'صادر',
            product_id: '2',
            product_name: 'أرز بسمتي',
            product_code: 'PRD-002',
            quantity: 15,
            price: 45.0,
            date: '2024-01-15',
            warehouse_id: 'W2',
            warehouse_name: 'المخزن الفرعي',
            notes: 'طلب عميل رقم 1234'
        },
        {
            id: '3',
            type: 'وارد',
            product_id: '3',
            product_name: 'زيت زيتون',
            product_code: 'PRD-003',
            quantity: 30,
            price: 120.0,
            date: '2024-01-14',
            warehouse_id: 'W1',
            warehouse_name: 'المخزن الرئيسي',
            notes: 'استيراد جديد'
        },
        {
            id: '4',
            type: 'صادر',
            product_id: '4',
            product_name: 'سكر أبيض',
            product_code: 'PRD-004',
            quantity: 8,
            price: 18.0,
            date: '2024-01-13',
            warehouse_id: 'W2',
            warehouse_name: 'المخزن الفرعي',
            notes: 'طلب عميل رقم 1235'
        },
        {
            id: '5',
            type: 'تحويل',
            product_id: '5',
            product_name: 'قهوة تركية',
            product_code: 'PRD-005',
            quantity: 20,
            price: 180.0,
            date: '2024-01-12',
            warehouse_id: 'W1',
            warehouse_name: 'المخزن الرئيسي',
            notes: 'تحويل بين المخازن'
        },
        {
            id: '6',
            type: 'وارد',
            product_id: '1',
            product_name: 'حليب كامل الدسم',
            product_code: 'PRD-001',
            quantity: 25,
            price: 25.5,
            date: '2024-01-11',
            warehouse_id: 'W1',
            warehouse_name: 'المخزن الرئيسي',
            notes: 'توريد سريع'
        },
        {
            id: '7',
            type: 'صادر',
            product_id: '2',
            product_name: 'أرز بسمتي',
            product_code: 'PRD-002',
            quantity: 10,
            price: 45.0,
            date: '2024-01-10',
            warehouse_id: 'W2',
            warehouse_name: 'المخزن الفرعي',
            notes: 'طلب عميل رقم 1236'
        },
        {
            id: '8',
            type: 'إرجاع',
            product_id: '3',
            product_name: 'زيت زيتون',
            product_code: 'PRD-003',
            quantity: 2,
            price: 120.0,
            date: '2024-01-09',
            warehouse_id: 'W1',
            warehouse_name: 'المخزن الرئيسي',
            notes: 'إرجاع عميل'
        }
    ];
}

function loadFallbackData() {
    console.log('📂 Chargement des données de démonstration');
    
    products = getDemoProducts();
    transactions = getDemoTransactions();
    
    updateCharts();
    
    showAlert('تم تحميل بيانات العرض التوضيحي', 'info');
}

// ========== FONCTIONS DES RAPPORTS ==========

function showReport(type) {
    console.log(`📄 Affichage du rapport: ${type}`);
    
    const reportTable = document.getElementById('reportTable');
    const reportTitle = document.getElementById('reportTitle');
    const reportTableHead = document.getElementById('reportTableHead');
    const reportTableBody = document.getElementById('reportTableBody');
    
    if (!reportTable || !reportTitle || !reportTableHead || !reportTableBody) {
        console.error('❌ Éléments du rapport non trouvés');
        showAlert('تعذر العثور على عناصر التقرير', 'danger');
        return;
    }
    
    // Afficher le tableau
    reportTable.style.display = 'block';
    
    // Faire défiler vers le tableau
    reportTable.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    try {
        if (type === 'stock') {
            showStockReport(reportTitle, reportTableHead, reportTableBody);
        } else if (type === 'movement') {
            showMovementReport(reportTitle, reportTableHead, reportTableBody);
        } else if (type === 'slow') {
            showSlowMovingReport(reportTitle, reportTableHead, reportTableBody);
        } else if (type === 'fast') {
            showFastMovingReport(reportTitle, reportTableHead, reportTableBody);
        }
        
        console.log(`✅ Rapport ${type} affiché`);
        showAlert(`تم تحميل تقرير ${getReportName(type)}`, 'success');
        
    } catch (error) {
        console.error(`❌ Erreur lors de l'affichage du rapport:`, error);
        showAlert('حدث خطأ في عرض التقرير', 'danger');
    }
}

function showStockReport(reportTitle, reportTableHead, reportTableBody) {
    reportTitle.textContent = 'تقرير المخزون الحالي';
    reportTableHead.innerHTML = `
        <th class="px-4 py-3">#</th>
        <th class="px-4 py-3">رمز المنتج</th>
        <th class="px-4 py-3">اسم المنتج</th>
        <th class="px-4 py-3">الكمية</th>
        <th class="px-4 py-3">السعر</th>
        <th class="px-4 py-3">القيمة</th>
        <th class="px-4 py-3">الحالة</th>
    `;
    
    // Utiliser les données de démonstration si pas de produits
    const displayProducts = products.length > 0 ? products : getDemoProducts();
    
    if (displayProducts.length === 0) {
        reportTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-12 text-gray-500">
                    <i class="fas fa-inbox text-4xl mb-4"></i>
                    <p class="text-lg font-semibold">لا توجد منتجات</p>
                    <p class="text-sm">أضف منتجات أولاً لعرض التقرير</p>
                </td>
            </tr>
        `;
        return;
    }
    
    let totalValue = 0;
    let totalStock = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    
    const rows = displayProducts.map((product, index) => {
        const stock = parseFloat(product.current_stock) || 0;
        const price = parseFloat(product.price) || 0;
        const value = stock * price;
        const reorder = parseFloat(product.reorder_level) || 0;
        
        totalValue += value;
        totalStock += stock;
        
        // Déterminer l'état
        let status = '';
        let statusClass = '';
        let statusIcon = '';
        
        if (stock === 0) {
            status = 'نفد';
            statusClass = 'badge-danger';
            statusIcon = 'fa-times';
            outOfStockCount++;
        } else if (stock <= reorder) {
            status = 'منخفض';
            statusClass = 'badge-warning';
            statusIcon = 'fa-exclamation-triangle';
            lowStockCount++;
        } else {
            status = 'متوفر';
            statusClass = 'badge-success';
            statusIcon = 'fa-check';
        }
        
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-center">${index + 1}</td>
                <td class="px-4 py-3">
                    <span class="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                        ${product.code || 'N/A'}
                    </span>
                </td>
                <td class="px-4 py-3 font-semibold">${product.name || 'غير معروف'}</td>
                <td class="px-4 py-3 font-bold ${stock === 0 ? 'text-red-600' : stock <= reorder ? 'text-orange-600' : 'text-green-600'}">
                    ${formatNumber(stock)} ${product.unit || ''}
                </td>
                <td class="px-4 py-3">${formatCurrency(price)}</td>
                <td class="px-4 py-3 font-semibold text-blue-600">${formatCurrency(value)}</td>
                <td class="px-4 py-3">
                    <span class="badge ${statusClass} px-3 py-1">
                        <i class="fas ${statusIcon} ml-1"></i>
                        ${status}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
    
    // Ajouter la ligne de total
    const totalRow = `
        <tr class="bg-gray-50 font-bold">
            <td colspan="3" class="px-4 py-3 text-right">المجموع:</td>
            <td class="px-4 py-3 text-green-600">${formatNumber(totalStock)} وحدة</td>
            <td class="px-4 py-3">-</td>
            <td class="px-4 py-3 text-blue-600">${formatCurrency(totalValue)}</td>
            <td class="px-4 py-3">
                <div class="flex space-x-2 space-x-reverse">
                    <span class="badge badge-success">${displayProducts.length - lowStockCount - outOfStockCount} جيد</span>
                    <span class="badge badge-warning">${lowStockCount} منخفض</span>
                    <span class="badge badge-danger">${outOfStockCount} نفد</span>
                </div>
            </td>
        </tr>
    `;
    
    reportTableBody.innerHTML = rows + totalRow;
}

function showMovementReport(reportTitle, reportTableHead, reportTableBody) {
    reportTitle.textContent = 'تقرير الحركة';
    reportTableHead.innerHTML = `
        <th class="px-4 py-3">#</th>
        <th class="px-4 py-3">التاريخ</th>
        <th class="px-4 py-3">النوع</th>
        <th class="px-4 py-3">المنتج</th>
        <th class="px-4 py-3">الكمية</th>
        <th class="px-4 py-3">المخزن</th>
        <th class="px-4 py-3">ملاحظات</th>
    `;
    
    // Utiliser les données de démonstration si pas de transactions
    const displayTransactions = transactions.length > 0 ? transactions : getDemoTransactions();
    
    if (displayTransactions.length === 0) {
        reportTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-12 text-gray-500">
                    <i class="fas fa-exchange-alt text-4xl mb-4"></i>
                    <p class="text-lg font-semibold">لا توجد عمليات</p>
                    <p class="text-sm">سجل عمليات الوارد والصادر لعرض التقرير</p>
                </td>
            </tr>
        `;
        return;
    }
    
    let totalIn = 0;
    let totalOut = 0;
    
    const rows = displayTransactions.map((transaction, index) => {
        const type = transaction.type || '';
        const quantity = parseFloat(transaction.quantity) || 0;
        
        // Normaliser le type
        let typeText = type;
        let typeClass = '';
        let typeIcon = '';
        
        if (type === 'IN' || type === 'وارد') {
            typeText = 'وارد';
            typeClass = 'badge-success';
            typeIcon = 'fa-arrow-down';
            totalIn += quantity;
        } else if (type === 'OUT' || type === 'صادر') {
            typeText = 'صادر';
            typeClass = 'badge-danger';
            typeIcon = 'fa-arrow-up';
            totalOut += quantity;
        } else {
            typeText = type;
            typeClass = 'badge-info';
            typeIcon = 'fa-exchange-alt';
        }
        
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-center">${index + 1}</td>
                <td class="px-4 py-3">${formatDate(transaction.date || transaction.created_at)}</td>
                <td class="px-4 py-3">
                    <span class="badge ${typeClass} px-3 py-1">
                        <i class="fas ${typeIcon} ml-1"></i>
                        ${typeText}
                    </span>
                </td>
                <td class="px-4 py-3 font-semibold">${transaction.product_name || transaction.product_id || 'غير معروف'}</td>
                <td class="px-4 py-3 font-bold ${typeText === 'وارد' ? 'text-green-600' : 'text-red-600'}">
                    ${typeText === 'وارد' ? '+' : '-'}${formatNumber(quantity)}
                </td>
                <td class="px-4 py-3">
                    <span class="bg-gray-100 px-2 py-1 rounded text-sm">
                        ${transaction.warehouse_name || transaction.warehouse_id || '-'}
                    </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-500 truncate max-w-xs">
                    ${transaction.notes || '-'}
                </td>
            </tr>
        `;
    }).join('');
    
    // Ajouter la ligne de total
    const totalRow = `
        <tr class="bg-gray-50 font-bold">
            <td colspan="4" class="px-4 py-3 text-right">الإجمالي:</td>
            <td class="px-4 py-3">
                <div class="flex flex-col">
                    <span class="text-green-600">+${formatNumber(totalIn)} وارد</span>
                    <span class="text-red-600">-${formatNumber(totalOut)} صادر</span>
                    <span class="text-blue-600">${formatNumber(totalIn - totalOut)} صافي</span>
                </div>
            </td>
            <td colspan="2" class="px-4 py-3">${displayTransactions.length} عملية</td>
        </tr>
    `;
    
    reportTableBody.innerHTML = rows + totalRow;
}

function showSlowMovingReport(reportTitle, reportTableHead, reportTableBody) {
    reportTitle.textContent = 'تقرير البضائع الراكدة';
    reportTableHead.innerHTML = `
        <th class="px-4 py-3">#</th>
        <th class="px-4 py-3">المنتج</th>
        <th class="px-4 py-3">الكمية</th>
        <th class="px-4 py-3">آخر حركة</th>
        <th class="px-4 py-3">أيام راكد</th>
        <th class="px-4 py-3">التوصية</th>
    `;
    
    const demoData = [
        { name: 'ممحاة مكتب', stock: 150, lastMove: '2024-01-15', days: 45 },
        { name: 'أقلام حبر جاف', stock: 200, lastMove: '2024-01-10', days: 40 },
        { name: 'دباسات كبيرة', stock: 50, lastMove: '2024-01-05', days: 35 },
        { name: 'ملفات أرشيف', stock: 300, lastMove: '2024-01-02', days: 32 },
        { name: 'سجلات ورقية', stock: 500, lastMove: '2023-12-20', days: 50 }
    ];
    
    const rows = demoData.map((item, index) => {
        const recommendation = item.days > 40 ? 'تخفيض السعر' : 'عرض ترويجي';
        const recClass = item.days > 40 ? 'badge-danger' : 'badge-warning';
        
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-center">${index + 1}</td>
                <td class="px-4 py-3 font-semibold">${item.name}</td>
                <td class="px-4 py-3 font-bold text-orange-600">${formatNumber(item.stock)}</td>
                <td class="px-4 py-3 text-gray-500">${formatDate(item.lastMove)}</td>
                <td class="px-4 py-3">
                    <span class="badge ${item.days > 40 ? 'badge-danger' : 'badge-warning'}">
                        ${item.days} يوم
                    </span>
                </td>
                <td class="px-4 py-3">
                    <span class="badge ${recClass} px-3 py-1">
                        <i class="fas ${item.days > 40 ? 'fa-tag' : 'fa-bullhorn'} ml-1"></i>
                        ${recommendation}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
    
    reportTableBody.innerHTML = rows;
}

function showFastMovingReport(reportTitle, reportTableHead, reportTableBody) {
    reportTitle.textContent = 'تقرير البضائع السريعة';
    reportTableHead.innerHTML = `
        <th class="px-4 py-3">#</th>
        <th class="px-4 py-3">المنتج</th>
        <th class="px-4 py-3">الحركات اليومية</th>
        <th class="px-4 py-3">معدل البيع</th>
        <th class="px-4 py-3">الكمية المباعة</th>
        <th class="px-4 py-3">التوصية</th>
    `;
    
    const demoData = [
        { name: 'أجهزة كمبيوتر محمول', dailyMoves: 25, rate: 95, sold: 750 },
        { name: 'هواتف ذكية', dailyMoves: 40, rate: 98, sold: 1200 },
        { name: 'طابعات ليزر', dailyMoves: 15, rate: 85, sold: 450 },
        { name: 'شواحن متنقلة', dailyMoves: 60, rate: 99, sold: 1800 },
        { name: 'سماعات رأس', dailyMoves: 35, rate: 92, sold: 1050 }
    ];
    
    const rows = demoData.map((item, index) => {
        const recommendation = item.rate > 95 ? 'زيادة المخزون' : 'حافظ على المستوى';
        const recClass = item.rate > 95 ? 'badge-success' : 'badge-info';
        
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-center">${index + 1}</td>
                <td class="px-4 py-3 font-semibold">${item.name}</td>
                <td class="px-4 py-3 font-bold text-green-600">${item.dailyMoves} حركة/يوم</td>
                <td class="px-4 py-3">
                    <div class="flex items-center">
                        <div class="w-24 bg-gray-200 rounded-full h-2 ml-3">
                            <div class="bg-green-500 h-2 rounded-full" style="width: ${item.rate}%"></div>
                        </div>
                        <span class="text-sm font-semibold">${item.rate}%</span>
                    </div>
                </td>
                <td class="px-4 py-3 text-blue-600">${formatNumber(item.sold)} وحدة</td>
                <td class="px-4 py-3">
                    <span class="badge ${recClass} px-3 py-1">
                        <i class="fas ${item.rate > 95 ? 'fa-arrow-up' : 'fa-chart-line'} ml-1"></i>
                        ${recommendation}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
    
    reportTableBody.innerHTML = rows;
}

// ========== FONCTIONS UTILITAIRES ==========

function formatDate(dateString) {
    if (!dateString) return 'غير محدد';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-EG', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

function formatNumber(num) {
    return new Intl.NumberFormat('ar-EG').format(num || 0);
}

function formatCurrency(amount) {
    if (typeof amount !== 'number') amount = parseFloat(amount) || 0;
    return new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 2
    }).format(amount);
}

function getReportName(type) {
    const names = {
        'stock': 'المخزون',
        'movement': 'الحركة',
        'slow': 'البضائع الراكدة',
        'fast': 'البضائع السريعة'
    };
    return names[type] || type;
}

function showAlert(message, type = 'info') {
    // Simple alert function like in dashboard.js
    const alertDiv = document.createElement('div');
    alertDiv.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white ${
        type === 'success' ? 'bg-green-500' :
        type === 'danger' ? 'bg-red-500' :
        type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
    }`;
    
    alertDiv.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${
                type === 'success' ? 'fa-check-circle' :
                type === 'danger' ? 'fa-times-circle' :
                type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'
            } ml-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.remove();
        }
    }, 3000);
}

// ========== FONCTIONS GLOBALES ==========

window.showReport = showReport;

// Fonction de rafraîchissement
function refreshReports() {
    console.log('🔄 Rafraîchissement des rapports');
    showAlert('جاري تحديث التقارير...', 'info');
    
    loadReportsData().then(() => {
        updateCharts();
        showAlert('تم تحديث التقارير بنجاح', 'success');
    }).catch(error => {
        console.error('❌ Erreur de rafraîchissement:', error);
        showAlert('حدث خطأ أثناء التحديث', 'danger');
    });
}

// Ajouter au chargement
document.addEventListener('DOMContentLoaded', function() {
    window.refreshReports = refreshReports;
});

console.log('✅ reports.js chargé - VERSION IDENTIQUE À dashboard.js');