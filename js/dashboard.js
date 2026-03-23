// dashboard.js - JavaScript pour la page de tableau de bord

let dashboardData = {
    products: [],
    transactions: [],
    warehouses: [],
    categories: []
};

let transactionsChart = null;
let categoryChart = null;

document.addEventListener('DOMContentLoaded', async function() {
    console.log('📊 Initialisation du tableau de bord...');
    
    try {
        // D'abord initialiser les graphiques
        initializeCharts();
        
        // Ensuite charger les données
        await loadDashboardData();
        
        // Ensuite mettre à jour les graphiques
        updateCharts();
        
        setupEventListeners();
        
        console.log('✅ Tableau de bord initialisé avec succès');
    } catch (error) {
        console.error('❌ Erreur lors du chargement du tableau de bord:', error);
        WMS.showAlert('حدث خطأ في تحميل بيانات لوحة التحكم', 'danger');
        
        // Afficher des données de secours
        displayFallbackData();
    }
});

function initializeCharts() {
    console.log('📈 Initialisation des graphiques...');
    
    // Transactions Chart
    const transactionsCtx = document.getElementById('transactionsChart');
    if (transactionsCtx) {
        transactionsChart = new Chart(transactionsCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
                datasets: [{
                    label: 'الوارد',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'الصادر',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        rtl: true,
                        labels: {
                            font: {
                                family: 'Cairo',
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        rtl: true,
                        titleFont: {
                            family: 'Cairo'
                        },
                        bodyFont: {
                            family: 'Cairo'
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
    }
    
    // Category Chart
    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
        categoryChart = new Chart(categoryCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['غير مصنف'],
                datasets: [{
                    data: [100],
                    backgroundColor: ['#3b82f6'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        rtl: true,
                        labels: {
                            font: {
                                family: 'Cairo',
                                size: 11
                            },
                            padding: 20
                        }
                    },
                    tooltip: {
                        rtl: true,
                        titleFont: {
                            family: 'Cairo'
                        },
                        bodyFont: {
                            family: 'Cairo'
                        }
                    }
                }
            }
        });
    }
}

async function loadDashboardData() {
    try {
        console.log('🔍 Chargement des données du tableau de bord...');
        
        // Utiliser des données de secours si l'API n'est pas disponible
        const useFallback = false;
        
        if (useFallback) {
            console.log('⚠️ Utilisation des données de secours');
            loadFallbackData();
            return;
        }
        
        // Essayer de charger depuis l'API
        const [productsData, transactionsData, warehousesData] = await Promise.allSettled([
            WMS.fetchData('products'),
            WMS.fetchData('transactions'),
            WMS.fetchData('warehouses')
        ]);
        
        console.log('📦 Résultats des requêtes:', {
            produits: productsData.status,
            transactions: transactionsData.status,
            entrepôts: warehousesData.status
        });
        
        // Traiter les produits
        if (productsData.status === 'fulfilled' && productsData.value && productsData.value.success) {
            dashboardData.products = productsData.value.data || [];
            console.log(`✅ ${dashboardData.products.length} produits chargés`);
        } else {
            console.warn('⚠️ Échec du chargement des produits, utilisation des données locales');
            dashboardData.products = getLocalProducts();
        }
        
        // Traiter les transactions
        if (transactionsData.status === 'fulfilled' && transactionsData.value && transactionsData.value.success) {
            dashboardData.transactions = transactionsData.value.data || [];
            console.log(`✅ ${dashboardData.transactions.length} transactions chargées`);
        } else {
            console.warn('⚠️ Échec du chargement des transactions, utilisation des données locales');
            dashboardData.transactions = getLocalTransactions();
        }
        
        // Traiter les entrepôts
        if (warehousesData.status === 'fulfilled' && warehousesData.value && warehousesData.value.success) {
            dashboardData.warehouses = warehousesData.value.data || [];
            console.log(`✅ ${dashboardData.warehouses.length} entrepôts chargés`);
        } else {
            console.warn('⚠️ Échec du chargement des entrepôts, utilisation des données locales');
            dashboardData.warehouses = getLocalWarehouses();
        }
        
        // Mettre à jour l'interface
        updateDashboardStats();
        updateLowStockTable();
        updateRecentTransactions();
        updateWarehousesOverview();
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des données:', error);
        throw error;
    }
}

function updateCharts() {
    console.log('🔄 Mise à jour des graphiques...');
    
    try {
        updateTransactionsChart();
        updateCategoryChart();
        console.log('✅ Graphiques mis à jour');
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour des graphiques:', error);
    }
}

function updateDashboardStats() {
    console.log('📊 Mise à jour des statistiques...');
    
    // Mettre à jour les cartes de statistiques
    document.getElementById('totalProducts').textContent = formatNumber(dashboardData.products.length);
    
    const totalValue = dashboardData.products.reduce((sum, product) => {
        return sum + (parseFloat(product.current_stock) || 0) * (parseFloat(product.price) || 0);
    }, 0);
    document.getElementById('totalValue').textContent = formatCurrency(totalValue);
    
    const lowStockCount = dashboardData.products.filter(product => {
        const stock = parseFloat(product.current_stock) || 0;
        const reorder = parseFloat(product.reorder_level) || 0;
        return stock <= reorder && stock > 0;
    }).length;
    document.getElementById('lowStockCount').textContent = formatNumber(lowStockCount);
    
    // Compter les transactions d'aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    const todayTransactions = dashboardData.transactions.filter(transaction => {
        const transDate = transaction.date || transaction.created_at;
        return transDate && transDate.startsWith(today);
    }).length;
    document.getElementById('todayTransactions').textContent = formatNumber(todayTransactions);
}

function updateLowStockTable() {
    const tbody = document.getElementById('lowStockTable');
    if (!tbody) {
        console.error('❌ Table body non trouvé');
        return;
    }
    
    // Filtrer les produits en stock bas (mais pas complètement épuisés)
    const lowStockProducts = dashboardData.products.filter(product => {
        const stock = parseFloat(product.current_stock) || 0;
        const reorder = parseFloat(product.reorder_level) || 0;
        return stock <= reorder && stock > 0;
    }).slice(0, 5);
    
    console.log(`⚠️ ${lowStockProducts.length} produits en stock bas`);
    
    if (lowStockProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="px-4 py-8 text-center text-gray-500">
                    <i class="fas fa-check-circle text-2xl text-green-500"></i>
                    <p class="mt-2">لا توجد منتجات منخفضة المخزون</p>
                    <p class="text-sm text-gray-400 mt-1">جميع المنتجات متوفرة بكميات كافية</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = lowStockProducts.map(product => {
        const stock = parseFloat(product.current_stock) || 0;
        const reorder = parseFloat(product.reorder_level) || 0;
        const statusClass = stock === 0 ? 'badge-danger' : 'badge-warning';
        const statusText = stock === 0 ? 'نفد' : 'نفد تقريباً';
        
        return `
            <tr class="hover:bg-gray-50 transition duration-200">
                <td class="px-4 py-3">
                    <div class="flex items-center">
                        <div class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center ml-3">
                            <i class="fas fa-box text-orange-600"></i>
                        </div>
                        <div>
                            <div class="font-semibold text-gray-800">${product.name || 'غير معروف'}</div>
                            <div class="text-xs text-gray-500">${product.code || 'لا يوجد رمز'}</div>
                        </div>
                    </div>
                </td>
                <td class="px-4 py-3">
                    <div class="flex items-center">
                        <div class="w-24 bg-gray-200 rounded-full h-2 ml-3">
                            <div class="bg-orange-500 h-2 rounded-full" style="width: ${Math.min((stock / reorder) * 100, 100)}%"></div>
                        </div>
                        <span class="font-bold text-orange-600">
                            ${formatNumber(stock)} ${product.unit || ''}
                        </span>
                    </div>
                </td>
                <td class="px-4 py-3">
                    <span class="badge ${statusClass}">
                        <i class="fas fa-exclamation-triangle ml-1"></i>
                        ${statusText}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

function updateRecentTransactions() {
    const container = document.getElementById('recentTransactions');
    if (!container) {
        console.error('❌ Container des transactions non trouvé');
        return;
    }
    
    // Trier par date (les plus récentes en premier) et limiter à 5
    const recentTransactions = [...dashboardData.transactions]
        .sort((a, b) => {
            const dateA = a.date || a.created_at || '2000-01-01';
            const dateB = b.date || b.created_at || '2000-01-01';
            return new Date(dateB) - new Date(dateA);
        })
        .slice(0, 5);
    
    console.log(`🔄 ${recentTransactions.length} transactions récentes`);
    
    if (recentTransactions.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-inbox text-3xl text-gray-400"></i>
                <p class="mt-2">لا توجد عمليات حديثة</p>
                <p class="text-sm text-gray-400 mt-1">سجل عمليات اليوم سيظهر هنا</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recentTransactions.map(transaction => {
        const type = transaction.type || 'IN';
        const quantity = parseFloat(transaction.quantity) || 0;
        
        const colors = {
            'IN': 'bg-green-100 text-green-800',
            'OUT': 'bg-red-100 text-red-800',
            'TRANSFER': 'bg-blue-100 text-blue-800',
            'وارد': 'bg-green-100 text-green-800',
            'صادر': 'bg-red-100 text-red-800',
            'تحويل': 'bg-blue-100 text-blue-800'
        };
        
        const icons = {
            'IN': 'fa-arrow-down',
            'OUT': 'fa-arrow-up',
            'TRANSFER': 'fa-exchange-alt',
            'وارد': 'fa-arrow-down',
            'صادر': 'fa-arrow-up',
            'تحويل': 'fa-exchange-alt'
        };
        
        const typeClass = colors[type] || 'bg-gray-100 text-gray-800';
        const typeIcon = icons[type] || 'fa-question';
        
        return `
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200 mb-3">
                <div class="flex items-center space-x-3 space-x-reverse">
                    <div class="${typeClass} rounded-full w-12 h-12 flex items-center justify-center">
                        <i class="fas ${typeIcon}"></i>
                    </div>
                    <div>
                        <p class="font-semibold text-gray-800">${transaction.product_name || transaction.product_id || 'غير معروف'}</p>
                        <p class="text-sm text-gray-500">
                            ${transaction.warehouse_name || transaction.warehouse_id || ''}
                            ${transaction.customer ? ` | ${transaction.customer}` : ''}
                        </p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-bold ${type === 'IN' || type === 'وارد' ? 'text-green-600' : 'text-red-600'}">
                        ${type === 'IN' || type === 'وارد' ? '+' : '-'}${formatNumber(quantity)}
                    </p>
                    <p class="text-xs text-gray-500">${formatTime(transaction.created_at || transaction.date)}</p>
                </div>
            </div>
        `;
    }).join('');
}

function updateWarehousesOverview() {
    const container = document.getElementById('warehousesOverview');
    if (!container) {
        console.error('❌ Container des entrepôts non trouvé');
        return;
    }
    
    console.log(`🏢 ${dashboardData.warehouses.length} entrepôts chargés`);
    
    if (dashboardData.warehouses.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-8 col-span-3">
                <i class="fas fa-warehouse text-3xl text-gray-400"></i>
                <p class="mt-2">لا توجد مخازن</p>
                <p class="text-sm text-gray-400 mt-1">أضف مخازن من صفحة إدارة المخازن</p>
            </div>
        `;
        return;
    }
    
    // Limiter à 3 entrepôts pour l'affichage
    const displayWarehouses = dashboardData.warehouses.slice(0, 3);
    
    container.innerHTML = displayWarehouses.map(warehouse => {
        // Compter les produits dans cet entrepôt
        const productsInWarehouse = dashboardData.products.filter(
            product => product.warehouse_id === warehouse.code || product.warehouse_id === warehouse.id
        ).length;
        
        // Calculer la valeur du stock
        const warehouseValue = dashboardData.products
            .filter(product => product.warehouse_id === warehouse.code || product.warehouse_id === warehouse.id)
            .reduce((sum, product) => {
                return sum + (parseFloat(product.current_stock) || 0) * (parseFloat(product.price) || 0);
            }, 0);
        
        // Calculer le taux de remplissage
        const capacity = parseFloat(warehouse.capacity) || 100;
        const fillRate = Math.min(Math.round((productsInWarehouse / capacity) * 100), 100);
        
        return `
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 hover:shadow-lg transition duration-300">
                <div class="flex items-center justify-between mb-4">
                    <div class="bg-blue-100 rounded-full w-14 h-14 flex items-center justify-center">
                        <i class="fas fa-warehouse text-blue-600 text-2xl"></i>
                    </div>
                    <span class="badge ${warehouse.status === 'نشط' ? 'badge-success' : 'badge-warning'}">
                        ${warehouse.status || 'نشط'}
                    </span>
                </div>
                <h4 class="text-lg font-bold text-gray-800 mb-2">${warehouse.name || 'مخزن غير معروف'}</h4>
                <p class="text-sm text-gray-600 mb-4">
                    <i class="fas fa-map-marker-alt ml-1"></i>
                    ${warehouse.location || 'غير محدد'}
                </p>
                
                <!-- Barre de progression -->
                <div class="mb-4">
                    <div class="flex justify-between text-sm text-gray-600 mb-1">
                        <span>معدل التخزين</span>
                        <span class="font-semibold">${fillRate}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-blue-500 h-2 rounded-full" style="width: ${fillRate}%"></div>
                    </div>
                </div>
                
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-600">عدد المنتجات</span>
                        <span class="font-semibold">${formatNumber(productsInWarehouse)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">قيمة المخزون</span>
                        <span class="font-semibold text-green-600">${formatCurrency(warehouseValue)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">السعة</span>
                        <span class="font-semibold">${formatNumber(capacity)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updateTransactionsChart() {
    if (!transactionsChart) {
        console.error('❌ Graphique des transactions non initialisé');
        return;
    }
    
    if (dashboardData.transactions.length === 0) {
        console.warn('⚠️ Aucune transaction à afficher');
        return;
    }
    
    try {
        // Grouper les transactions par jour (7 derniers jours)
        const last7Days = getLast7Days();
        const dailyData = {
            inbound: new Array(7).fill(0),
            outbound: new Array(7).fill(0)
        };
        
        dashboardData.transactions.forEach(transaction => {
            const date = transaction.date || transaction.created_at;
            if (!date) return;
            
            const dateStr = new Date(date).toISOString().split('T')[0];
            const dayIndex = last7Days.indexOf(dateStr);
            
            if (dayIndex !== -1) {
                const quantity = parseFloat(transaction.quantity) || 0;
                const type = transaction.type || 'IN';
                
                if (type === 'IN' || type === 'وارد') {
                    dailyData.inbound[dayIndex] += quantity;
                } else if (type === 'OUT' || type === 'صادر') {
                    dailyData.outbound[dayIndex] += quantity;
                }
            }
        });
        
        // Formater les dates pour l'affichage
        const displayLabels = last7Days.map(date => {
            const d = new Date(date);
            const dayNames = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
            return `${dayNames[d.getDay()]} ${d.getDate()}`;
        });
        
        // Mettre à jour le graphique
        transactionsChart.data.labels = displayLabels;
        transactionsChart.data.datasets[0].data = dailyData.inbound;
        transactionsChart.data.datasets[1].data = dailyData.outbound;
        transactionsChart.update();
        
        console.log('✅ Graphique des transactions mis à jour');
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour du graphique des transactions:', error);
    }
}

function updateCategoryChart() {
    if (!categoryChart) {
        console.error('❌ Graphique des catégories non initialisé');
        return;
    }
    
    if (dashboardData.products.length === 0) {
        console.warn('⚠️ Aucun produit à afficher');
        return;
    }
    
    try {
        // Grouper les produits par catégorie
        const categories = {};
        dashboardData.products.forEach(product => {
            const category = product.category || 'غير مصنف';
            if (!categories[category]) {
                categories[category] = 0;
            }
            categories[category]++;
        });
        
        // Préparer les données pour le graphique
        const labels = Object.keys(categories);
        const data = Object.values(categories);
        
        // Couleurs pour les catégories
        const colors = [
            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
            '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
            '#14b8a6', '#f43f5e', '#8b5cf6', '#0ea5e9', '#84cc16'
        ];
        
        // Mettre à jour le graphique
        categoryChart.data.labels = labels;
        categoryChart.data.datasets[0].data = data;
        categoryChart.data.datasets[0].backgroundColor = colors.slice(0, labels.length);
        categoryChart.update();
        
        console.log('✅ Graphique des catégories mis à jour');
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour du graphique des catégories:', error);
    }
}

// ========== FONCTIONS UTILITAIRES ==========

function getLast7Days() {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
}

function formatTime(dateString) {
    if (!dateString) return 'غير محدد';
    
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMins < 1) return 'الآن';
        if (diffMins < 60) return `قبل ${diffMins} دقيقة`;
        if (diffHours < 24) return `قبل ${diffHours} ساعة`;
        if (diffDays < 7) return `قبل ${diffDays} يوم`;
        
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
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function setupEventListeners() {
    // Écouteur pour le sélecteur de période
    const periodSelect = document.querySelector('select');
    if (periodSelect) {
        periodSelect.addEventListener('change', function() {
            console.log('🔄 Changement de période:', this.value);
            WMS.showAlert('تم تغيير فترة العرض', 'info');
        });
    }
    
    // Bouton de rafraîchissement manuel
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
            e.preventDefault();
            refreshDashboard();
        }
    });
    
    // Ajouter un bouton de rafraîchissement au header
    const header = document.querySelector('.bg-white.shadow-md');
    if (header) {
        const refreshBtn = document.createElement('button');
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt ml-2"></i>تحديث';
        refreshBtn.className = 'btn btn-primary text-sm';
        refreshBtn.onclick = refreshDashboard;
        
        const buttonsDiv = header.querySelector('.flex.items-center.space-x-4');
        if (buttonsDiv) {
            buttonsDiv.insertBefore(refreshBtn, buttonsDiv.firstChild);
        }
    }
}

// ========== DONNÉES DE SECOURS ==========

function getLocalProducts() {
    return [
        {
            id: 'P001',
            code: 'PRD-001',
            name: 'حليب كامل الدسم',
            category: 'مشتقات الحليب',
            unit: 'علبة',
            price: 25.5,
            current_stock: 15,
            reorder_level: 20,
            warehouse_id: 'W1'
        },
        {
            id: 'P002',
            code: 'PRD-002',
            name: 'أرز بسمتي',
            category: 'مواد غذائية',
            unit: 'كيلو',
            price: 45,
            current_stock: 85,
            reorder_level: 30,
            warehouse_id: 'W2'
        },
        {
            id: 'P003',
            code: 'PRD-003',
            name: 'زيت زيتون',
            category: 'زيوت',
            unit: 'لتر',
            price: 120,
            current_stock: 42,
            reorder_level: 15,
            warehouse_id: 'W1'
        },
        {
            id: 'P004',
            code: 'PRD-004',
            name: 'سكر أبيض',
            category: 'مواد غذائية',
            unit: 'كيلو',
            price: 18,
            current_stock: 5,
            reorder_level: 25,
            warehouse_id: 'W2'
        }
    ];
}

function getLocalTransactions() {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    return [
        {
            id: 'T001',
            type: 'وارد',
            product_name: 'حليب كامل الدسم',
            quantity: 50,
            date: today,
            warehouse_name: 'المخزن الرئيسي'
        },
        {
            id: 'T002',
            type: 'صادر',
            product_name: 'أرز بسمتي',
            quantity: 15,
            date: today,
            warehouse_name: 'المخزن الفرعي'
        },
        {
            id: 'T003',
            type: 'وارد',
            product_name: 'زيت زيتون',
            quantity: 30,
            date: yesterdayStr,
            warehouse_name: 'المخزن الرئيسي'
        },
        {
            id: 'T004',
            type: 'صادر',
            product_name: 'سكر أبيض',
            quantity: 8,
            date: yesterdayStr,
            warehouse_name: 'المخزن الفرعي'
        }
    ];
}

function getLocalWarehouses() {
    return [
        {
            id: 'W1',
            name: 'المخزن الرئيسي',
            location: 'القاهرة',
            capacity: 1000,
            status: 'نشط'
        },
        {
            id: 'W2',
            name: 'المخزن الفرعي',
            location: 'الجيزة',
            capacity: 500,
            status: 'نشط'
        }
    ];
}

function loadFallbackData() {
    console.log('📂 Chargement des données de secours...');
    
    dashboardData.products = getLocalProducts();
    dashboardData.transactions = getLocalTransactions();
    dashboardData.warehouses = getLocalWarehouses();
    
    updateDashboardStats();
    updateLowStockTable();
    updateRecentTransactions();
    updateWarehousesOverview();
    updateCharts();
    
    WMS.showAlert('تم تحميل بيانات العرض التوضيحي', 'info');
}

function displayFallbackData() {
    // Mettre à jour les statistiques avec des valeurs par défaut
    document.getElementById('totalProducts').textContent = '12';
    document.getElementById('totalValue').textContent = '3,450.50 ج.م';
    document.getElementById('lowStockCount').textContent = '2';
    document.getElementById('todayTransactions').textContent = '4';
    
    // Afficher un message d'erreur dans les tables
    const tables = [
        'lowStockTable',
        'recentTransactions',
        'warehousesOverview'
    ];
    
    tables.forEach(tableId => {
        const element = document.getElementById(tableId);
        if (element) {
            element.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <i class="fas fa-exclamation-triangle text-2xl text-orange-500 mb-3"></i>
                    <p class="font-semibold">تعذر تحميل البيانات</p>
                    <p class="text-sm mt-1">الرجاء التحقق من اتصال الخادم</p>
                    <button onclick="refreshDashboard()" class="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition">
                        <i class="fas fa-redo ml-1"></i>إعادة المحاولة
                    </button>
                </div>
            `;
        }
    });
}

// ========== FONCTIONS GLOBALES ==========

async function refreshDashboard() {
    console.log('🔄 Rafraîchissement du tableau de bord...');
    WMS.showAlert('جاري تحديث البيانات...', 'info');
    
    try {
        await loadDashboardData();
        updateCharts();
        WMS.showAlert('تم تحديث البيانات بنجاح', 'success');
    } catch (error) {
        console.error('❌ Erreur lors du rafraîchissement:', error);
        WMS.showAlert('حدث خطأ أثناء تحديث البيانات', 'danger');
        loadFallbackData();
    }
}

function exportDashboardData() {
    const data = {
        timestamp: new Date().toISOString(),
        statistics: {
            totalProducts: dashboardData.products.length,
            totalValue: dashboardData.products.reduce((sum, p) => sum + (parseFloat(p.current_stock) || 0) * (parseFloat(p.price) || 0), 0),
            lowStockCount: dashboardData.products.filter(p => (parseFloat(p.current_stock) || 0) <= (parseFloat(p.reorder_level) || 0)).length,
            todayTransactions: dashboardData.transactions.filter(t => {
                const transDate = t.date || t.created_at;
                const today = new Date().toISOString().split('T')[0];
                return transDate && transDate.startsWith(today);
            }).length
        },
        products: dashboardData.products.length,
        transactions: dashboardData.transactions.length,
        warehouses: dashboardData.warehouses.length
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    WMS.showAlert('تم تصدير بيانات لوحة التحكم', 'success');
}

// Exporter les fonctions globales
window.refreshDashboard = refreshDashboard;
window.exportDashboardData = exportDashboardData;

console.log('✅ dashboard.js chargé et prêt');