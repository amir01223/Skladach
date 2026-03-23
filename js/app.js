// app.js
// Handles authentication guard, role-based navigation, and shared utilities.

const App = (() => {
    const publicPages = ['index.html', 'login.html'];

    const permissions = {
        admin: ['dashboard', 'inventory', 'transactions', 'reports', 'warehouses', 'users', 'settings'],
        supervisor: ['dashboard', 'inventory', 'transactions', 'reports', 'warehouses'],
        employee: ['dashboard', 'inventory', 'transactions'],
    };

    function getCurrentPage() {
        const path = window.location.pathname;
        const file = path.substring(path.lastIndexOf('/') + 1);
        return file || 'index.html';
    }

    function getPageKey() {
        const file = getCurrentPage();
        return file.replace('.html', '');
    }

    function getUserData() {
        try {
            const data = localStorage.getItem('userData');
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    }

    function getUserRole() {
        return localStorage.getItem('userRole') || null;
    }

    function isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }

    function redirectToLogin() {
        if (getCurrentPage() !== 'login.html') {
            window.location.href = 'login.html';
        }
    }

    function redirectToDashboard() {
        if (getCurrentPage() !== 'dashboard.html') {
            window.location.href = 'dashboard.html';
        }
    }

    function enforceAuthentication() {
        const currentPage = getCurrentPage();
        if (publicPages.includes(currentPage)) {
            // If user already logged in, keep them in dashboard
            if (isLoggedIn() && currentPage === 'login.html') {
                redirectToDashboard();
            }
            return;
        }

        if (!isLoggedIn()) {
            redirectToLogin();
        }
    }

    function enforcePermissions() {
        const role = getUserRole();
        const pageKey = getPageKey();

        if (!role || !permissions[role]) return;
        const allowed = permissions[role];

        // If this page is not allowed for this role, send to dashboard
        if (!allowed.includes(pageKey)) {
            redirectToDashboard();
        }

        // Hide navigation links that are not permitted
        document.querySelectorAll('a[href$=".html"]').forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;
            const targetKey = href.replace('.html', '');
            if (targetKey && !allowed.includes(targetKey) && !publicPages.includes(href)) {
                // Keep login/index links always visible
                link.style.display = 'none';
            }
        });
    }

    function applyUserName() {
        const user = getUserData();
        if (!user) return;
        const name = user.name || user.username || '';

        // Replace welcome placeholders
        document.querySelectorAll('[data-i18n="welcome_user"]').forEach(el => {
            // If translation includes {name}, it will be replaced by languageSwitcher.
            if (el.textContent.includes('{name}')) {
                el.textContent = el.textContent.replace('{name}', name);
            }
        });

        // If there are elements with [data-user-name], set them
        document.querySelectorAll('[data-user-name]').forEach(el => {
            el.textContent = name;
        });
    }

    function init() {
        enforceAuthentication();
        enforcePermissions();
        applyUserName();
    }

    return {
        init,
        getUserData,
        getUserRole,
        isLoggedIn
    };
})();

// Auto init
document.addEventListener('DOMContentLoaded', () => {
    if (typeof App !== 'undefined' && App && App.init) {
        App.init();
    }
});
