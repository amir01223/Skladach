// Inventory Management JavaScript
let allProducts = [];
let categories = [];
let warehouses = [];
let formErrors = {};

document.addEventListener('DOMContentLoaded', async function() {
    await loadInventoryData();
    setupEventListeners();
});

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const warehouseFilter = document.getElementById('warehouseFilter');
    const statusFilter = document.getElementById('statusFilter');

    if (searchInput) searchInput.addEventListener('input', debounce(filterInventory, 300));
    if (categoryFilter) categoryFilter.addEventListener('change', filterInventory);
    if (warehouseFilter) warehouseFilter.addEventListener('change', filterInventory);
    if (statusFilter) statusFilter.addEventListener('change', filterInventory);
}

async function loadInventoryData() {
    try {
        console.log('🔍 Chargement des données inventory...');
        
        const [productsData, categoriesData, warehousesData] = await Promise.all([
            WMS.fetchData('products'),
            WMS.fetchData('categories'),
            WMS.fetchData('warehouses')
        ]);

        console.log('📦 Produits reçus:', productsData?.data?.length || 0);
        console.log('📊 Catégories reçues:', categoriesData?.data?.length || 0);
        console.log('🏢 Entrepôts reçus:', warehousesData?.data?.length || 0);

        if (productsData && productsData.data) {
            allProducts = productsData.data;
            console.log(`✅ ${allProducts.length} produits chargés`);
            displayInventory(allProducts);
        } else {
            console.error('❌ Aucune donnée produit');
            displayInventory([]);
        }

        if (categoriesData && categoriesData.data) {
            categories = categoriesData.data;
            populateCategoryFilters();
        }

        if (warehousesData && warehousesData.data) {
            warehouses = warehousesData.data;
            populateWarehouseFilters();
        }
    } catch (error) {
        console.error('❌ Erreur chargement données:', error);
        WMS.showAlert('حدث خطأ في تحميل البيانات', 'danger');
        displayInventory([]);
    }
}

function displayInventory(products) {
    const tbody = document.getElementById('inventoryTableBody');
    if (!tbody) {
        console.error('❌ Table body non trouvé');
        return;
    }
    
    console.log(`📋 Affichage de ${products.length} produits`);
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="text-center py-8"><i class="fas fa-inbox text-3xl text-gray-400"></i><p class="mt-2 text-gray-500">لا توجد منتجات</p></td></tr>';
        return;
    }

    tbody.innerHTML = products.map(product => {
        const value = (product.current_stock || 0) * (product.price || 0);
        const isLow = WMS.isLowStock(product.current_stock, product.reorder_level);
        const statusClass = isLow ? (product.current_stock === 0 ? 'badge-danger' : 'badge-warning') : 'badge-success';
        const statusText = isLow ? (product.current_stock === 0 ? 'نفد' : 'نفد تقريباً') : 'متوفر';
        
        return `
            <tr class="hover:bg-gray-50 transition" data-product-id="${product.id}">
                <td class="px-4 py-3 font-mono text-sm">${product.code || '-'}</td>
                <td class="px-4 py-3">
                    <div class="font-semibold text-gray-800">${product.name}</div>
                    <div class="text-xs text-gray-500">${product.barcode || '-'}</div>
                </td>
                <td class="px-4 py-3">${product.category || '-'}</td>
                <td class="px-4 py-3 font-bold ${isLow ? 'text-orange-600' : 'text-green-600'}">
                    ${WMS.formatNumber(product.current_stock)} ${product.unit || ''}
                </td>
                <td class="px-4 py-3">${WMS.formatCurrency(product.price || 0)}</td>
                <td class="px-4 py-3 font-semibold text-blue-600">${WMS.formatCurrency(value)}</td>
                <td class="px-4 py-3">
                    <span class="text-sm text-gray-600">${getWarehouseName(product.warehouse_id)}</span>
                </td>
                <td class="px-4 py-3">
                    <span class="badge ${statusClass}">${statusText}</span>
                </td>
                <td class="px-4 py-3">
                    <div class="flex space-x-2 space-x-reverse">
                        <button class="view-product-btn text-blue-600 hover:text-blue-800 transition" title="عرض" data-id="${product.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="edit-product-btn text-green-600 hover:text-green-800 transition" title="تعديل" data-id="${product.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-product-btn text-red-600 hover:text-red-800 transition" title="حذف" data-id="${product.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    addActionEventListeners();
    console.log('✅ Tableau mis à jour avec event listeners');
}

function addActionEventListeners() {
    document.querySelectorAll('.view-product-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            viewProduct(productId);
        });
    });

    document.querySelectorAll('.edit-product-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            editProduct(productId);
        });
    });

    document.querySelectorAll('.delete-product-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            deleteProduct(productId);
        });
    });
}

function getWarehouseName(warehouseId) {
    const warehouse = warehouses.find(w => w.code === warehouseId);
    return warehouse ? warehouse.name : 'غير محدد';
}

function populateCategoryFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const categorySelect = document.getElementById('categorySelect');
    
    if (categoryFilter) {
        categoryFilter.innerHTML = '<option value="">جميع الفئات</option>' + 
            categories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('');
    }
    if (categorySelect) {
        categorySelect.innerHTML = '<option value="">اختر الفئة</option>' + 
            categories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('');
    }
}

function populateWarehouseFilters() {
    const warehouseFilter = document.getElementById('warehouseFilter');
    const warehouseSelect = document.getElementById('warehouseSelect');
    
    if (warehouseFilter) {
        warehouseFilter.innerHTML = '<option value="">جميع المخازن</option>' + 
            warehouses.map(wh => `<option value="${wh.name}">${wh.name}</option>`).join('');
    }
    if (warehouseSelect) {
        warehouseSelect.innerHTML = '<option value="">اختر المخزن</option>' + 
            warehouses.map(wh => `<option value="${wh.code}">${wh.name}</option>`).join('');
    }
}

function filterInventory() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const warehouseFilter = document.getElementById('warehouseFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    let filtered = allProducts.filter(product => {
        const matchesSearch = !searchTerm || 
            product.name.toLowerCase().includes(searchTerm) || 
            (product.code && product.code.toLowerCase().includes(searchTerm)) ||
            (product.barcode && product.barcode.toLowerCase().includes(searchTerm));
        
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        const matchesWarehouse = !warehouseFilter || getWarehouseName(product.warehouse_id) === warehouseFilter;
        
        let matchesStatus = true;
        if (statusFilter) {
            const isLow = WMS.isLowStock(product.current_stock, product.reorder_level);
            if (statusFilter === 'متوفر') matchesStatus = !isLow;
            else if (statusFilter === 'نفد تقريباً') matchesStatus = isLow && product.current_stock > 0;
            else if (statusFilter === 'نفد') matchesStatus = product.current_stock === 0;
        }

        return matchesSearch && matchesCategory && matchesWarehouse && matchesStatus;
    });

    displayInventory(filtered);
}

// ==================== NOUVELLE VALIDATION ====================

async function validateAndAddProduct() {
    formErrors = {};
    hideAllErrors();
    
    validateProductName();
    validateProductCode();
    validateBarcode();
    validateCategory();
    validateUnit();
    validatePrice();
    validateCost();
    validateStock();
    validateReorderLevel();
    validateWarehouse();
    validateExpiryDate();
    
    if (Object.keys(formErrors).length > 0) {
        showFormErrors();
        return;
    }
    
    await addProduct();
}

function validateProductName() {
    const nameInput = document.getElementById('productName');
    const errorElement = document.getElementById('nameError');
    const value = nameInput.value.trim();
    
    if (!value) {
        showError('name', 'اسم المنتج مطلوب', errorElement, nameInput);
        return false;
    }
    
    if (value.length < 2) {
        showError('name', 'اسم المنتج يجب أن يكون على الأقل حرفين', errorElement, nameInput);
        return false;
    }
    
    hideError('name', errorElement, nameInput);
    return true;
}

function validateProductCode() {
    const codeInput = document.getElementById('productCode');
    const errorElement = document.getElementById('codeError');
    const value = codeInput.value.trim();
    
    if (!value) {
        showError('code', 'رمز المنتج مطلوب', errorElement, codeInput);
        return false;
    }
    
    const isDuplicate = allProducts.some(product => 
        product.code && product.code.toLowerCase() === value.toLowerCase()
    );
    
    if (isDuplicate) {
        showError('code', 'رمز المنتج موجود مسبقاً', errorElement, codeInput);
        return false;
    }
    
    hideError('code', errorElement, codeInput);
    return true;
}

function validateBarcode() {
    const barcodeInput = document.getElementById('productBarcode');
    const errorElement = document.getElementById('barcodeError');
    const value = barcodeInput.value.trim();
    
    if (value && !/^[0-9]+$/.test(value)) {
        showError('barcode', 'الباركود يجب أن يحتوي على أرقام فقط', errorElement, barcodeInput);
        return false;
    }
    
    if (value) {
        const isDuplicate = allProducts.some(product => 
            product.barcode && product.barcode === value
        );
        
        if (isDuplicate) {
            showError('barcode', 'الباركود موجود مسبقاً', errorElement, barcodeInput);
            return false;
        }
    }
    
    hideError('barcode', errorElement, barcodeInput);
    return true;
}

function validateCategory() {
    const categorySelect = document.getElementById('categorySelect');
    const errorElement = document.getElementById('categoryError');
    const value = categorySelect.value;
    
    if (!value) {
        showError('category', 'يجب اختيار الفئة', errorElement, categorySelect);
        return false;
    }
    
    hideError('category', errorElement, categorySelect);
    return true;
}

function validateUnit() {
    const unitInput = document.getElementById('productUnit');
    const errorElement = document.getElementById('unitError');
    const value = unitInput.value.trim();
    
    if (!value) {
        showError('unit', 'وحدة القياس مطلوبة', errorElement, unitInput);
        return false;
    }
    
    hideError('unit', errorElement, unitInput);
    return true;
}

function validatePrice() {
    const priceInput = document.getElementById('productPrice');
    const errorElement = document.getElementById('priceError');
    const value = parseFloat(priceInput.value);
    
    if (isNaN(value) || value < 0) {
        showError('price', 'السعر يجب أن يكون رقم موجب', errorElement, priceInput);
        return false;
    }
    
    hideError('price', errorElement, priceInput);
    return true;
}

function validateCost() {
    const costInput = document.getElementById('productCost');
    const errorElement = document.getElementById('costError');
    const priceInput = document.getElementById('productPrice');
    const costValue = parseFloat(costInput.value);
    const priceValue = parseFloat(priceInput.value);
    
    if (isNaN(costValue) || costValue < 0) {
        showError('cost', 'التكلفة يجب أن تكون رقم موجب', errorElement, costInput);
        return false;
    }
    
    if (costValue > priceValue) {
        showError('cost', 'التكلفة لا يمكن أن تكون أعلى من سعر البيع', errorElement, costInput);
        return false;
    }
    
    hideError('cost', errorElement, costInput);
    return true;
}

function validateStock() {
    const stockInput = document.getElementById('productStock');
    const errorElement = document.getElementById('stockError');
    const value = parseInt(stockInput.value);
    
    if (isNaN(value) || value < 0) {
        showError('stock', 'الكمية يجب أن تكون رقم موجب', errorElement, stockInput);
        return false;
    }
    
    hideError('stock', errorElement, stockInput);
    return true;
}

function validateReorderLevel() {
    const reorderInput = document.getElementById('reorderLevel');
    const errorElement = document.getElementById('reorderError');
    const value = parseInt(reorderInput.value);
    
    if (isNaN(value) || value < 0) {
        showError('reorder', 'حد إعادة الطلب يجب أن يكون رقم موجب', errorElement, reorderInput);
        return false;
    }
    
    hideError('reorder', errorElement, reorderInput);
    return true;
}

function validateWarehouse() {
    const warehouseSelect = document.getElementById('warehouseSelect');
    const errorElement = document.getElementById('warehouseError');
    const value = warehouseSelect.value;
    
    if (!value) {
        showError('warehouse', 'يجب اختيار المخزن', errorElement, warehouseSelect);
        return false;
    }
    
    hideError('warehouse', errorElement, warehouseSelect);
    return true;
}

function validateExpiryDate() {
    const expiryInput = document.getElementById('expiryDate');
    const errorElement = document.getElementById('expiryError');
    const value = expiryInput.value;
    
    if (value) {
        const expiryDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (expiryDate < today) {
            showError('expiry', 'تاريخ الصلاحية لا يمكن أن يكون في الماضي', errorElement, expiryInput);
            return false;
        }
    }
    
    hideError('expiry', errorElement, expiryInput);
    return true;
}

function showError(field, message, errorElement, inputElement) {
    formErrors[field] = message;
    errorElement.textContent = message;
    errorElement.classList.add('show');
    inputElement.parentElement.classList.add('error');
}

function hideError(field, errorElement, inputElement) {
    delete formErrors[field];
    errorElement.classList.remove('show');
    inputElement.parentElement.classList.remove('error');
}

function hideAllErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.classList.remove('show');
    });
    document.querySelectorAll('.form-group').forEach(el => {
        el.classList.remove('error');
    });
    document.getElementById('formErrors').classList.add('hidden');
}

function showFormErrors() {
    const errorSummary = document.getElementById('formErrors');
    const errorList = Object.values(formErrors).map(error => 
        `<li>${error}</li>`
    ).join('');
    
    errorSummary.innerHTML = `
        <strong>يوجد أخطاء في النموذج:</strong>
        <ul class="list-disc mr-4 mt-2">${errorList}</ul>
    `;
    errorSummary.classList.remove('hidden');
    errorSummary.scrollIntoView({ behavior: 'smooth' });
}

async function addProduct() {
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i>جاري الحفظ...';
        
        const formData = {
            name: document.getElementById('productName').value.trim(),
            code: document.getElementById('productCode').value.trim(),
            barcode: document.getElementById('productBarcode').value.trim() || null,
            category: document.getElementById('categorySelect').value,
            unit: document.getElementById('productUnit').value.trim(),
            price: parseFloat(document.getElementById('productPrice').value),
            cost: parseFloat(document.getElementById('productCost').value),
            current_stock: parseInt(document.getElementById('productStock').value),
            reorder_level: parseInt(document.getElementById('reorderLevel').value),
            warehouse_id: document.getElementById('warehouseSelect').value,
            expiry_date: document.getElementById('expiryDate').value || null
        };

        const result = await WMS.postData('products', formData);
        
        if (result && result.success) {
            WMS.showAlert(result.message, 'success');
            WMS.closeModal('addProductModal');
            document.getElementById('addProductForm').reset();
            await loadInventoryData();
        } else {
            throw new Error(result?.message || 'فشل في إضافة المنتج');
        }
    } catch (error) {
        console.error('❌ Erreur lors de l\'ajout du produit:', error);
        WMS.showAlert(error.message || 'حدث خطأ أثناء إضافة المنتج', 'danger');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

function viewProduct(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) {
        console.error('Produit non trouvé:', productId);
        return;
    }

    const value = (product.current_stock || 0) * (product.price || 0);
    
    const modalContent = `
        <div class="bg-white rounded-lg max-w-2xl w-full mx-auto p-6">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-bold text-gray-800">تفاصيل المنتج</h3>
                <button onclick="WMS.closeModal('productDetailModal')" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div class="col-span-2 border-b pb-4">
                    <h4 class="font-semibold text-lg text-blue-600">${product.name}</h4>
                    <p class="text-gray-600">${product.code || 'لا يوجد رمز'}</p>
                </div>
                
                <div><span class="font-semibold">الباركود:</span> ${product.barcode || '-'}</div>
                <div><span class="font-semibold">الفئة:</span> ${product.category || '-'}</div>
                <div><span class="font-semibold">الوحدة:</span> ${product.unit || '-'}</div>
                <div><span class="font-semibold">المخزن:</span> ${getWarehouseName(product.warehouse_id)}</div>
                
                <div><span class="font-semibold">المخزون الحالي:</span> ${WMS.formatNumber(product.current_stock)}</div>
                <div><span class="font-semibold">حد إعادة الطلب:</span> ${WMS.formatNumber(product.reorder_level)}</div>
                
                <div><span class="font-semibold">سعر البيع:</span> ${WMS.formatCurrency(product.price)}</div>
                <div><span class="font-semibold">التكلفة:</span> ${WMS.formatCurrency(product.cost)}</div>
                
                <div class="col-span-2">
                    <span class="font-semibold">القيمة الإجمالية:</span> 
                    <span class="font-bold text-green-600">${WMS.formatCurrency(value)}</span>
                </div>
            </div>
            
            <div class="mt-6 flex justify-end">
                <button onclick="WMS.closeModal('productDetailModal')" class="btn btn-primary">
                    إغلاق
                </button>
            </div>
        </div>
    `;

    let modal = document.getElementById('productDetailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'productDetailModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = modalContent;
    WMS.openModal('productDetailModal');
}

function editProduct(productId) {
    WMS.showAlert('سيتم إضافة وظيفة التعديل في التحديث القادم', 'info');
}

function deleteProduct(productId) {
    WMS.confirmAction('هل أنت متأكد من حذف هذا المنتج؟', async () => {
        const result = await WMS.deleteData('products', productId);
        if (result) {
            WMS.showAlert('تم حذف المنتج بنجاح', 'success');
            await loadInventoryData();
        }
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for global access
window.validateAndAddProduct = validateAndAddProduct;
window.validateProductName = validateProductName;
window.validateProductCode = validateProductCode;
window.validateBarcode = validateBarcode;
window.validateCategory = validateCategory;
window.validateUnit = validateUnit;
window.validatePrice = validatePrice;
window.validateCost = validateCost;
window.validateStock = validateStock;
window.validateReorderLevel = validateReorderLevel;
window.validateWarehouse = validateWarehouse;
window.validateExpiryDate = validateExpiryDate;
window.viewProduct = viewProduct;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.filterInventory = filterInventory;