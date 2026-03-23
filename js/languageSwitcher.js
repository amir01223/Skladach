// languageSwitcher.js
// Provides a unified language switcher UI and translation engine across all pages.

(function (ws) {
    // Ensure we can augment an existing languageSwitcher if present.
    ws = ws || {};

    const supportedLangs = ws.supportedLangs || {
        fr: "Français",
        ar: "العربية",
        en: "English",
        ru: "Русский",
    };

    const cache = {};
    const localStorageKey = 'preferredLang';

    function getStoredLang() {
        const stored = localStorage.getItem(localStorageKey);
        if (stored && Object.keys(supportedLangs).includes(stored)) return stored;
        return null;
    }

    function getBrowserLang() {
        const lang = navigator.language.split('-')[0];
        return Object.keys(supportedLangs).includes(lang) ? lang : null;
    }

    function getDefaultLang() {
        // Default to Arabic, but respect stored or browser preference.
        return getStoredLang() || getBrowserLang() || 'ar';
    }

    async function loadRawLocale(lang) {
        if (!Object.keys(supportedLangs).includes(lang)) {
            lang = 'en';
        }

        if (cache[lang]) return cache[lang];

        try {
            const url = new URL(`locales/${lang}.json`, window.location.href).href;
            const response = await fetch(url, { cache: 'no-store' });
            if (!response.ok) throw new Error(`Could not load locale ${lang}`);
            const data = await response.json();
            cache[lang] = data;
            return data;
        } catch (err) {
            console.warn('Language switcher: failed to load locale', lang, err);
            if (lang !== 'en') return loadRawLocale('en');
            return {};
        }
    }

    async function loadLocale(lang) {
        const base = await loadRawLocale('en');
        if (lang === 'en') return base;

        const target = await loadRawLocale(lang);
        const merged = {
            ...base,
            ...target,
        };

        cache[lang] = merged;
        return merged;
    }

    function applyTranslations(translations) {
        const userName = localStorage.getItem('userName') || '';

        // Translate data-i18n content
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key && translations[key]) {
                let value = translations[key];
                if (typeof value === 'string') {
                    value = value.replace('{name}', userName);
                }
                el.textContent = value;
            }
        });

        // Translate placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (key && translations[key]) {
                el.placeholder = translations[key];
            }
        });

        // Translate title attributes
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            if (key && translations[key]) {
                el.title = translations[key];
            }
        });

        // Update document title if applicable
        if (translations.system_name) {
            const currentTitleSuffix = document.title.includes(' - ') ? document.title.split(' - ')[1] : '';
            document.title = translations.system_name + (currentTitleSuffix ? ' - ' + currentTitleSuffix : '');
        }
    }

    function updateDirection(lang) {
        const html = document.documentElement;
        const body = document.body;

        if (lang === 'ar') {
            html.dir = 'rtl';
            html.lang = 'ar';
            body.classList.add('rtl');
            body.classList.remove('ltr');
        } else {
            html.dir = 'ltr';
            html.lang = lang;
            body.classList.add('ltr');
            body.classList.remove('rtl');
        }
    }

    function setActiveButton(lang) {
        document.querySelectorAll('.lang-btn, .language-item').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
        });
    }

    function buildSwitcherUI() {
        let containers = Array.from(document.querySelectorAll('[class*="language-switcher"]'));

        // If no language switcher markup exists, create a floating one.
        if (!containers.length) {
            const container = document.createElement('div');
            container.className = 'language-switcher language-switcher-container';
            document.body.appendChild(container);
            containers = [container];
        }

        containers.forEach(container => {
            container.classList.add('language-switcher-container');

            const toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'lang-toggle';
            toggle.setAttribute('aria-label', 'Change language');
            toggle.innerHTML = '<i class="fas fa-globe"></i>';

            const menu = document.createElement('div');
            menu.className = 'language-menu';
            menu.setAttribute('role', 'menu');
            menu.style.display = 'none';

            let buttons = Array.from(container.querySelectorAll('.lang-btn'));

            // If the page didn't define lang-btn buttons, generate them from supported languages.
            if (!buttons.length) {
                buttons = Object.keys(supportedLangs).map(lang => {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'lang-btn';
                    btn.setAttribute('data-lang', lang);
                    btn.textContent = supportedLangs[lang];
                    container.appendChild(btn);
                    return btn;
                });
            }

            buttons.forEach(btn => {
                const lang = btn.getAttribute('data-lang');
                const label = btn.textContent.trim() || supportedLangs[lang] || lang;

                const item = document.createElement('button');
                item.type = 'button';
                item.className = 'language-item';
                item.setAttribute('data-lang', lang);
                item.setAttribute('role', 'menuitem');
                item.textContent = label;

                item.addEventListener('click', () => {
                    setLanguage(lang);
                    closeMenu();
                });

                menu.appendChild(item);
            });

            buttons.forEach(btn => btn.style.display = 'none');

            function openMenu() {
                menu.style.display = 'block';
                document.addEventListener('click', docClick);
            }

            function closeMenu() {
                menu.style.display = 'none';
                document.removeEventListener('click', docClick);
            }

            function docClick(e) {
                if (!container.contains(e.target)) {
                    closeMenu();
                }
            }

            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                if (menu.style.display === 'block') {
                    closeMenu();
                } else {
                    openMenu();
                }
            });

            container.insertBefore(toggle, container.firstChild);
            container.appendChild(menu);
        });

        if (!document.getElementById('language-switcher-styles')) {
            const style = document.createElement('style');
            style.id = 'language-switcher-styles';
            style.textContent = `
                .language-switcher-container {
                    position: fixed;
                    top: 16px;
                    right: 16px;
                    z-index: 1100;
                    display: flex;
                    align-items: flex-start;
                    gap: 0.5rem;
                    padding: 0.35rem;
                    border-radius: 999px;
                    background: rgba(255,255,255,0.9);
                    box-shadow: 0 10px 24px rgba(0,0,0,0.12);
                    backdrop-filter: blur(10px);
                }
                body.ltr .language-switcher-container {
                    right: auto;
                    left: 16px;
                }
                .language-switcher-container .lang-toggle {
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    padding: 6px;
                    border-radius: 999px;
                    font-size: 18px;
                    color: #333;
                    transition: transform 0.2s ease;
                }
                .language-switcher-container .lang-toggle:hover {
                    transform: scale(1.05);
                }
                .language-switcher-container .language-menu {
                    position: absolute;
                    top: 45px;
                    right: 0;
                    background: rgba(255,255,255,0.96);
                    border-radius: 12px;
                    box-shadow: 0 14px 40px rgba(0,0,0,0.12);
                    padding: 8px 0;
                    min-width: 160px;
                    overflow: hidden;
                    border: 1px solid rgba(0,0,0,0.08);
                }
                body.ltr .language-switcher-container .language-menu {
                    right: auto;
                    left: 0;
                }
                .language-switcher-container .language-item {
                    width: 100%;
                    border: none;
                    background: transparent;
                    padding: 10px 14px;
                    text-align: left;
                    cursor: pointer;
                    font-size: 14px;
                    color: #333;
                }
                .language-switcher-container .language-item:hover {
                    background: rgba(52, 152, 219, 0.12);
                }
                .language-switcher-container .language-item.active {
                    background: rgba(52, 152, 219, 0.2);
                    font-weight: 700;
                }
            `;
            document.head.appendChild(style);
        }
    }

    async function setLanguage(lang) {
        if (!Object.keys(supportedLangs).includes(lang)) return;
        const translations = await loadLocale(lang);
        applyTranslations(translations);
        updateDirection(lang);
        setActiveButton(lang);
        localStorage.setItem(localStorageKey, lang);
    }

    async function init() {
        buildSwitcherUI();
        const lang = getDefaultLang();
        await setLanguage(lang);
    }

    ws.init = init;
    ws.setLanguage = setLanguage;
    ws.supportedLangs = supportedLangs;

    // If global languageSwitcher is writable, set it. Otherwise we assume the existing object will be used.
    const descriptor = Object.getOwnPropertyDescriptor(window, 'languageSwitcher');
    if (!descriptor || descriptor.writable) {
        window.languageSwitcher = ws;
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (window.languageSwitcher && typeof window.languageSwitcher.init === 'function') {
            window.languageSwitcher.init();
        }
    });

})(window.languageSwitcher || {});
