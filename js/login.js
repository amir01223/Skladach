// login.js - JavaScript pour la page de connexion

document.addEventListener('DOMContentLoaded', function() {
    initializeLoginPage();
    checkRememberedUser();
});

function initializeLoginPage() {
    // Initialiser les écouteurs d'événements
    setupEventListeners();
    setupFormValidation();
}

function setupEventListeners() {
    // Entrer pour soumettre le formulaire
    document.getElementById('username')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('password')?.focus();
        }
    });
    
    document.getElementById('password')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            validateAndLogin();
        }
    });
    
    // Effacer les erreurs lors de la saisie
    document.querySelectorAll('#loginForm input').forEach(input => {
        input.addEventListener('input', function() {
            clearError(this.id);
        });
    });
}

function setupFormValidation() {
    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            validateAndLogin();
        });
    }
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const passwordIcon = document.getElementById('passwordIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordIcon.classList.remove('fa-eye');
        passwordIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        passwordIcon.classList.remove('fa-eye-slash');
        passwordIcon.classList.add('fa-eye');
    }
}

function validateAndLogin() {
    const username = document.getElementById('username')?.value.trim();
    const password = document.getElementById('password')?.value.trim();
    const rememberMe = document.getElementById('rememberMe')?.checked;
    const autoLogin = document.getElementById('autoLogin')?.checked;
    
    // Validation
    const errors = validateLoginForm(username, password);
    
    if (Object.keys(errors).length > 0) {
        displayFormErrors(errors);
        return;
    }
    
    // Tentative de connexion
    attemptLogin(username, password, rememberMe, autoLogin);
}

function validateLoginForm(username, password) {
    const errors = {};
    
    if (!username) {
        errors.username = 'اسم المستخدم أو البريد الإلكتروني مطلوب';
    } else if (username.length < 3) {
        errors.username = 'اسم المستخدم يجب أن يكون على الأقل 3 أحرف';
    } else if (!isValidUsername(username)) {
        errors.username = 'صيغة اسم المستخدم غير صحيحة';
    }
    
    if (!password) {
        errors.password = 'كلمة المرور مطلوبة';
    } else if (password.length < 6) {
        errors.password = 'كلمة المرور يجب أن تكون على الأقل 6 أحرف';
    }
    
    return errors;
}

function isValidUsername(username) {
    // Validation simple - pourrait être améliorée
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
    
    return emailRegex.test(username) || usernameRegex.test(username);
}

function displayFormErrors(errors) {
    // Effacer les erreurs précédentes
    clearAllErrors();
    
    // Afficher les nouvelles erreurs
    for (const [field, message] of Object.entries(errors)) {
        const errorElement = document.getElementById(`${field}Error`);
        const inputElement = document.getElementById(field);
        
        if (errorElement && inputElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
            inputElement.classList.add('border-red-500');
            inputElement.classList.remove('border-gray-200');
        }
    }
    
    // Focus sur le premier champ avec erreur
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
        document.getElementById(firstErrorField)?.focus();
    }
}

function clearError(fieldId) {
    const errorElement = document.getElementById(`${fieldId}Error`);
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement) {
        errorElement.classList.remove('show');
        errorElement.textContent = '';
    }
    
    if (inputElement) {
        inputElement.classList.remove('border-red-500');
        inputElement.classList.add('border-gray-200');
    }
}

function clearAllErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.classList.remove('show');
        el.textContent = '';
    });
    
    document.querySelectorAll('#loginForm input').forEach(input => {
        input.classList.remove('border-red-500');
        input.classList.add('border-gray-200');
    });
}

async function attemptLogin(username, password, rememberMe, autoLogin) {
    const loginButton = document.getElementById('loginButton');
    const originalText = loginButton.innerHTML;
    
    try {
        // État de chargement
        loginButton.disabled = true;
        loginButton.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i>جاري التحقق...';
        
        // Essayer d'abord l'authentification API
        const apiResult = await attemptApiLogin(username, password);
        
        if (apiResult.success) {
            handleSuccessfulLogin(username, password, rememberMe, autoLogin, apiResult.user);
        } else {
            // Fallback aux comptes de démonstration
            handleDemoLogin(username, password, rememberMe, autoLogin);
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showLoginError('حدث خطأ أثناء محاولة الدخول. يرجى المحاولة مرة أخرى.');
    } finally {
        loginButton.disabled = false;
        loginButton.innerHTML = originalText;
    }
}

async function attemptApiLogin(username, password) {
    try {
        // Essayer de se connecter via l'API (si disponible)
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            return { success: true, user: data.user };
        }
        
        return { success: false };
    } catch (error) {
        console.log('API login not available, using demo accounts');
        return { success: false };
    }
}

function handleDemoLogin(username, password, rememberMe, autoLogin) {
    const demoAccounts = {
        'admin': { password: 'admin123', role: 'admin', name: 'أحمد محمود' },
        'supervisor': { password: 'sup123', role: 'supervisor', name: 'محمد علي' },
        'employee': { password: 'emp123', role: 'employee', name: 'سارة أحمد' },
        'admin@example.com': { password: 'admin123', role: 'admin', name: 'أحمد محمود' },
        'supervisor@example.com': { password: 'sup123', role: 'supervisor', name: 'محمد علي' },
        'employee@example.com': { password: 'emp123', role: 'employee', name: 'سارة أحمد' }
    };
    
    const account = demoAccounts[username];
    
    if (account && account.password === password) {
        handleSuccessfulLogin(username, password, rememberMe, autoLogin, {
            id: 'U001',
            username: username,
            name: account.name,
            role: account.role,
            email: username.includes('@') ? username : `${username}@example.com`
        });
    } else {
        showLoginError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
}

function handleSuccessfulLogin(username, password, rememberMe, autoLogin, userData) {
    // Afficher message de succès
    showLoginSuccess(`مرحباً ${userData.name}! جاري التوجيه...`);
    
    // Sauvegarder les préférences
    saveLoginPreferences(username, rememberMe, autoLogin);
    
    // Sauvegarder les données utilisateur
    saveUserData(userData);
    
    // Rediriger vers le tableau de bord
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1500);
}

function saveLoginPreferences(username, rememberMe, autoLogin) {
    if (rememberMe) {
        localStorage.setItem('rememberedUser', username);
        localStorage.setItem('rememberMe', 'true');
    } else {
        localStorage.removeItem('rememberedUser');
        localStorage.removeItem('rememberMe');
    }
    
    if (autoLogin) {
        localStorage.setItem('autoLogin', 'true');
    } else {
        localStorage.removeItem('autoLogin');
    }
}

function saveUserData(userData) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('userRole', userData.role);
    localStorage.setItem('userName', userData.name);
}

function checkRememberedUser() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    const rememberMe = localStorage.getItem('rememberMe');
    const autoLogin = localStorage.getItem('autoLogin');
    
    if (rememberedUser && document.getElementById('username')) {
        document.getElementById('username').value = rememberedUser;
    }
    
    if (rememberMe === 'true' && document.getElementById('rememberMe')) {
        document.getElementById('rememberMe').checked = true;
    }
    
    if (autoLogin === 'true' && document.getElementById('autoLogin')) {
        document.getElementById('autoLogin').checked = true;
        
        // Si auto-login est activé et qu'il y a un utilisateur mémorisé, focus sur le mot de passe
        if (rememberedUser && document.getElementById('password')) {
            document.getElementById('password').focus();
        }
    }
    
    // Vérifier si déjà connecté
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        window.location.href = 'dashboard.html';
    }
}

function showLoginSuccess(message) {
    showAlert(message, 'success');
}

function showLoginError(message) {
    showAlert(message, 'danger');
}

function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
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
    
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);
    
    // Supprimer automatiquement après 5 secondes
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 5000);
}

// Fonctions de connexion sociale
function loginWithGoogle() {
    showAlert('سيتم تفعيل تسجيل الدخول عبر Google في النسخة القادمة', 'info');
}

function loginWithMicrosoft() {
    showAlert('سيتم تفعيل تسجيل الدخول عبر Microsoft في النسخة القادمة', 'info');
}

// Fonction de déconnexion (à appeler depuis d'autres pages)
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    window.location.href = 'login.html';
}

// Rendre les fonctions accessibles globalement
window.togglePassword = togglePassword;
window.validateAndLogin = validateAndLogin;
window.loginWithGoogle = loginWithGoogle;
window.loginWithMicrosoft = loginWithMicrosoft;
window.logout = logout;