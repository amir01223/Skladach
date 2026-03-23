let langueActuelle = 'fr'; // Langue par défaut
const traductions = {}; // Stockera les textes chargés

// Fonction pour charger et appliquer une langue
async function chargerLangue(codeLangue) {
    if (langueActuelle === codeLangue) return; // Déjà active

    try {
        // 1. Charger le fichier de langue
        const reponse = await fetch(`/project/locales/${codeLangue}.json`);
        if (!reponse.ok) throw new Error('Fichier langue introuvable');
        const donneesLangue = await reponse.json();

        // 2. Sauvegarder et appliquer
        traductions[codeLangue] = donneesLangue;
        langueActuelle = codeLangue;
        localStorage.setItem('languePreferee', codeLangue); // Préférence utilisateur
        appliquerTraductions(codeLangue);

        // 3. Gestion du sens de lecture (RTL pour l'arabe)
        document.documentElement.dir = (codeLangue === 'ar') ? 'rtl' : 'ltr';
        document.documentElement.lang = codeLangue;

    } catch (erreur) {
        console.error('Échec du chargement de la langue :', erreur);
    }
}

// Fonction pour remplacer le texte dans le HTML
function appliquerTraductions(codeLangue) {
    const donnees = traductions[codeLangue];
    // Éléments avec data-i18n (texte)
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const cle = element.getAttribute('data-i18n');
        if (donnees[cle]) element.textContent = donnees[cle];
    });
    // Éléments avec data-i18n-placeholder (champs de saisie)
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const cle = element.getAttribute('data-i18n-placeholder');
        if (donnees[cle]) element.placeholder = donnees[cle];
    });
}

// Au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // Langue préférée sauvegardée OU langue du navigateur OU français par défaut
    const langueSauvegardee = localStorage.getItem('languePreferee');
    const langueNavigateur = navigator.language.split('-')[0];
    const languesDisponibles = ['fr', 'ar', 'en', 'ru'];
    const langueInit = languesDisponibles.includes(langueSauvegardee)
        ? langueSauvegardee
        : (languesDisponibles.includes(langueNavigateur) ? langueNavigateur : 'fr');

    chargerLangue(langueInit);

    // Ajouter les événements aux boutons
    document.querySelectorAll('.btn-langue').forEach(bouton => {
        bouton.addEventListener('click', (e) => {
            const langue = e.target.getAttribute('data-lang');
            chargerLangue(langue);
        });
    });
});