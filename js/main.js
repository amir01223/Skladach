// Main JavaScript for Warehouse Management System

// API base URL (helps mobile/remote access by avoiding hard-coded localhost)
const API_PORT = 3000;
const API_BASE = (function() {
    if (window.API_BASE_URL) return window.API_BASE_URL;

    const protocol = window.location.protocol;
    const host = window.location.hostname;
    const port = window.location.port;

    // If running from file:// (e.g., opening HTML directly), fall back to localhost.
    if (protocol === 'file:') {
        return `http://localhost:${API_PORT}/api`;
    }

    // If current page is already served from API port, use the same origin.
    if (port === String(API_PORT)) {
        return `${protocol}//${host}/api`;
    }

    // Otherwise, assume API is on the same host but on the configured port.
    return `${protocol}//${host}:${API_PORT}/api`;
})();

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize App
function initializeApp() {
    // Add smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Initialize tooltips
    initializeTooltips();
}

// Toggle Sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebar) {
        sidebar.classList.toggle('hidden');
    }
    if (mainContent) {
        mainContent.classList.toggle('full-width');
    }
}

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Alert Functions
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;

    const icons = {
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle',
        danger: 'fa-times-circle',
        info: 'fa-info-circle'
    };

    const alert = document.createElement('div');
    alert.className = `alert alert-${type} fade-in`;
    alert.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
        <i class="fas fa-times cursor-pointer" onclick="this.parentElement.remove()"></i>
    `;

    alertContainer.appendChild(alert);

    // Auto remove after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Search and Filter Functions
function filterTable(searchInput, tableId) {
    const input = document.getElementById(searchInput);
    const table = document.getElementById(tableId);
    
    if (!input || !table) return;

    const filter = input.value.toLowerCase();
    const rows = table.getElementsByTagName('tr');

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.getElementsByTagName('td');
        let found = false;

        for (let j = 0; j < cells.length; j++) {
            const cell = cells[j];
            if (cell.textContent.toLowerCase().indexOf(filter) > -1) {
                found = true;
                break;
            }
        }

        row.style.display = found ? '' : 'none';
    }
}

// Sort Table
function sortTable(tableId, columnIndex, isNumeric = false) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const tbody = table.getElementsByTagName('tbody')[0];
    const rows = Array.from(tbody.getElementsByTagName('tr'));

    rows.sort((a, b) => {
        const aValue = a.getElementsByTagName('td')[columnIndex].textContent;
        const bValue = b.getElementsByTagName('td')[columnIndex].textContent;

        if (isNumeric) {
            return parseFloat(aValue) - parseFloat(bValue);
        }
        return aValue.localeCompare(bValue, 'ar');
    });

    rows.forEach(row => tbody.appendChild(row));
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString('ar-EG', options);
}

// Format Currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: 'EGP'
    }).format(amount);
}

// Format Number
function formatNumber(number) {
    return new Intl.NumberFormat('ar-EG').format(number);
}

// Export Table to Excel
function exportTableToExcel(tableId, filename = 'export.xlsx') {
    const table = document.getElementById(tableId);
    if (!table) return;

    // This is a simple CSV export, for real Excel you'd need a library
    let csv = [];
    const rows = table.querySelectorAll('tr');

    rows.forEach(row => {
        const cols = row.querySelectorAll('td, th');
        const csvRow = [];
        cols.forEach(col => csvRow.push(col.textContent));
        csv.push(csvRow.join(','));
    });

    downloadCSV(csv.join('\n'), filename.replace('.xlsx', '.csv'));
}

// Download CSV
function downloadCSV(csv, filename) {
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Print Function
function printPage() {
    window.print();
}

// Initialize Tooltips
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('data-tooltip');
            document.body.appendChild(tooltip);

            const rect = this.getBoundingClientRect();
            tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
            tooltip.style.left = (rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)) + 'px';
        });

        element.addEventListener('mouseleave', function() {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) tooltip.remove();
        });
    });
}

// Local Storage Functions
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Error saving to localStorage:', e);
        return false;
    }
}

function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Error loading from localStorage:', e);
        return null;
    }
}

// API Helper Functions - CONNECTÉES À LA BASE DE DONNÉES
async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_BASE}/${endpoint}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data from', endpoint, ':', error);
        
        // Fallback aux données locales si l'API échoue
        const localData = loadFromLocalStorage(endpoint);
        if (localData) {
            showAlert('تم تحميل البيانات من الذاكرة المحلية', 'warning');
            return localData;
        }
        
        showAlert('حدث خطأ في تحميل البيانات. تحقق من اتصال الخادم', 'danger');
        return { success: false, data: [], message: error.message };
    }
}

async function postData(endpoint, data) {
    try {
        const response = await fetch(`${API_BASE}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error posting data to', endpoint, ':', error);
        showAlert('حدث خطأ في حفظ البيانات', 'danger');
        return { success: false, message: error.message };
    }
}

async function updateData(endpoint, id, data) {
    try {
        const response = await fetch(`http://localhost:3000/api/${endpoint}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error updating data at', endpoint, ':', error);
        showAlert('حدث خطأ في تحديث البيانات', 'danger');
        return { success: false, message: error.message };
    }
}

async function deleteData(endpoint, id) {
    try {
        const response = await fetch(`http://localhost:3000/api/${endpoint}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error deleting data at', endpoint, ':', error);
        showAlert('حدث خطأ في حذف البيانات', 'danger');
        return { success: false, message: error.message };
    }
}

// Confirmation Dialog
function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// Debounce Function
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

// Barcode Scanner Simulation
function scanBarcode(callback) {
    const barcode = prompt('أدخل الباركود:');
    if (barcode) {
        callback(barcode);
    }
}

// Generate QR Code (placeholder - would need a library)
function generateQRCode(data, elementId) {
    console.log('Generating QR Code for:', data);
    showAlert('سيتم إضافة مولد QR Code في التحديث القادم', 'info');
}

// Notification Function
function showNotification(title, message, type = 'info') {
    // Check if browser supports notifications
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: '/icon.png'
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(title, {
                        body: message,
                        icon: '/icon.png'
                    });
                }
            });
        }
    }
    
    // Fallback to alert
    showAlert(message, type);
}

// Validate Form
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('border-red-500');
            isValid = false;
        } else {
            input.classList.remove('border-red-500');
        }
    });

    if (!isValid) {
        showAlert('الرجاء ملء جميع الحقول المطلوبة', 'warning');
    }

    return isValid;
}

// Reset Form
function resetForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        // Remove validation classes
        form.querySelectorAll('.border-red-500').forEach(el => {
            el.classList.remove('border-red-500');
        });
    }
}

// Calculate Stock Value
function calculateStockValue(quantity, price) {
    return quantity * price;
}

// Check Low Stock
function isLowStock(currentStock, reorderLevel) {
    return currentStock <= reorderLevel;
}

// Get Status Badge Class
function getStatusBadgeClass(status) {
    const statusMap = {
        'نشط': 'badge-success',
        'متوفر': 'badge-success',
        'غير نشط': 'badge-danger',
        'نفد تقريباً': 'badge-warning',
        'نفد': 'badge-danger'
    };
    return statusMap[status] || 'badge-info';
}

// Database Operations
async function addProduct(productData) {
    try {
        const result = await postData('products', productData);
        if (result && result.success) {
            showAlert(result.message, 'success');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error adding product:', error);
        showAlert('حدث خطأ في إضافة المنتج', 'danger');
        return false;
    }
}

async function addTransaction(transactionData) {
    try {
        const result = await postData('transactions', transactionData);
        if (result && result.success) {
            showAlert(result.message, 'success');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error adding transaction:', error);
        showAlert('حدث خطأ في إضافة العملية', 'danger');
        return false;
    }
}

// Export object for global access
window.WMS = {
    toggleSidebar,
    openModal,
    closeModal,
    showAlert,
    filterTable,
    sortTable,
    formatDate,
    formatCurrency,
    formatNumber,
    exportTableToExcel,
    printPage,
    saveToLocalStorage,
    loadFromLocalStorage,
    fetchData,
    postData,
    updateData,
    deleteData,
    confirmAction,
    debounce,
    scanBarcode,
    generateQRCode,
    showNotification,
    validateForm,
    resetForm,
    calculateStockValue,
    isLowStock,
    getStatusBadgeClass,
    addProduct,
    addTransaction
};