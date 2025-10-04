/**
 * Multilingual i18n System for flong.dev
 * Supports: English, Spanish, Italian
 */

class I18n {
  constructor() {
    this.currentLang = this.detectLanguage();
    this.supportedLangs = ['en', 'es', 'it'];
    this.translations = {};
    this.init();
  }

  /**
   * Detect user's preferred language
   */
  detectLanguage() {
    // Check localStorage first
    const stored = localStorage.getItem('preferred-language');
    if (stored && ['en', 'es', 'it'].includes(stored)) {
      return stored;
    }

    // Check browser language
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('es')) return 'es';
    if (browserLang.startsWith('it')) return 'it';
    
    return 'en'; // Default to English
  }

  /**
   * Initialize i18n system
   */
  init() {
    this.loadTranslations();
    this.applyLanguage(this.currentLang);
    this.setupLanguageToggle();
    this.updateMetaTags(this.currentLang);
  }

  /**
   * Load translations from data attributes
   */
  loadTranslations() {
    document.querySelectorAll('[data-en], [data-es], [data-it]').forEach(el => {
      const key = el.getAttribute('data-key') || this.generateKey(el);
      this.translations[key] = {
        en: el.getAttribute('data-en'),
        es: el.getAttribute('data-es'),
        it: el.getAttribute('data-it'),
        element: el
      };
    });
  }

  /**
   * Generate a unique key for an element
   */
  generateKey(element) {
    return element.id || `i18n_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Apply language to all translatable elements
   */
  applyLanguage(lang) {
    this.currentLang = lang;

    // Update HTML lang attribute
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('data-language', lang);

    // Translate elements with data attributes
    document.querySelectorAll('[data-' + lang + ']').forEach(el => {
      const translation = el.getAttribute('data-' + lang);
      if (translation) {
        // Special handling for option elements
        if (el.tagName === 'OPTION') {
          el.textContent = translation;
          // If this option is currently selected, update the select display
          if (el.selected && el.parentElement) {
            el.parentElement.dispatchEvent(new Event('change', { bubbles: true }));
          }
        } else {
          el.textContent = translation;
        }
      }
    });

    // Translate placeholders
    document.querySelectorAll('[data-placeholder-' + lang + ']').forEach(el => {
      const placeholder = el.getAttribute('data-placeholder-' + lang);
      if (placeholder) {
        el.setAttribute('placeholder', placeholder);
      }
    });

    // Translate aria-labels
    document.querySelectorAll('[data-aria-' + lang + ']').forEach(el => {
      const ariaLabel = el.getAttribute('data-aria-' + lang);
      if (ariaLabel) {
        el.setAttribute('aria-label', ariaLabel);
      }
    });

    // Update meta tags
    this.updateMetaTags(lang);

    // Store preference
    localStorage.setItem('preferred-language', lang);

    // Dispatch event for analytics
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));

    // Update language toggle button
    this.updateLanguageToggle(lang);
  }

  /**
   * Update meta tags for SEO
   */
  updateMetaTags(lang) {
    const langNames = {
      en: 'English',
      es: 'Español',
      it: 'Italiano'
    };

    const titles = {
      en: 'Franco Longstaff - IT Systems Administrator | DevOps Expert Perth | flong.dev',
      es: 'Franco Longstaff - Administrador de Sistemas IT | Experto DevOps Perth | flong.dev',
      it: 'Franco Longstaff - Amministratore di Sistemi IT | Esperto DevOps Perth | flong.dev'
    };

    const descriptions = {
      en: 'Professional IT Systems Administrator & DevOps expert in Perth, Australia. Specializing in Proxmox virtualization, Microsoft Azure, enterprise infrastructure with 99.9% uptime.',
      es: 'Administrador de Sistemas IT profesional y experto DevOps en Perth, Australia. Especializado en virtualización Proxmox, Microsoft Azure, infraestructura empresarial con 99.9% uptime.',
      it: 'Amministratore di Sistemi IT professionale ed esperto DevOps a Perth, Australia. Specializzato in virtualizzazione Proxmox, Microsoft Azure, infrastruttura aziendale con 99.9% uptime.'
    };

    // Update title
    document.title = titles[lang] || titles.en;

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', descriptions[lang] || descriptions.en);

    // Update og:locale
    const locales = { en: 'en_AU', es: 'es_AR', it: 'it_IT' };
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute('content', locales[lang]);

    // Update language meta tag
    const langMeta = document.querySelector('meta[name="language"]');
    if (langMeta) langMeta.setAttribute('content', langNames[lang]);
  }

  /**
   * Setup language toggle button and dropdown
   */
  setupLanguageToggle() {
    const toggleBtn = document.getElementById('languageToggle');
    const dropdown = document.getElementById('langDropdown');
    const langOptions = document.querySelectorAll('.lang-option');

    if (!toggleBtn || !dropdown) return;

    // Toggle dropdown
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== toggleBtn) {
        dropdown.classList.remove('active');
      }
    });

    // Handle language option clicks
    langOptions.forEach(option => {
      option.addEventListener('click', () => {
        const lang = option.getAttribute('data-lang');
        this.applyLanguage(lang);
        dropdown.classList.remove('active');
      });
    });
  }

  /**
   * Update language toggle button and dots
   */
  updateLanguageToggle(lang) {
    const currentLangEl = document.getElementById('currentLang');
    const langOptions = document.querySelectorAll('.lang-option');
    const langDots = document.querySelectorAll('.lang-dot');

    const langNames = { en: 'EN', es: 'ES', it: 'IT' };

    // Update current language text
    if (currentLangEl) {
      currentLangEl.textContent = langNames[lang];
    }

    // Update active dot
    langDots.forEach(dot => {
      if (dot.getAttribute('data-lang') === lang) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // Update selected option in dropdown
    langOptions.forEach(option => {
      if (option.getAttribute('data-lang') === lang) {
        option.classList.add('selected');
      } else {
        option.classList.remove('selected');
      }
    });
  }

  /**
   * Get current language
   */
  getCurrentLanguage() {
    return this.currentLang;
  }

  /**
   * Switch to specific language
   */
  switchTo(lang) {
    if (this.supportedLangs.includes(lang)) {
      this.applyLanguage(lang);
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.i18n = new I18n();
  });
} else {
  window.i18n = new I18n();
}

// Track language changes in analytics
window.addEventListener('languageChanged', (e) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'language_change', {
      'event_category': 'engagement',
      'event_label': e.detail.language,
      'value': 1
    });
  }
});
