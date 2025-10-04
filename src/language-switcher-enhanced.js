/**
 * Enhanced Language Switcher with Advanced Animations
 * - Single click: Cycles through languages with smooth transition
 * - Double click: Expands to show all three languages
 * - Animated indicator that moves between language positions
 */

class EnhancedLanguageSwitcher {
  constructor() {
    this.languages = ['en', 'es', 'it'];
    this.languageNames = {
      en: { short: 'EN', full: 'English', flag: '🇬🇧' },
      es: { short: 'ES', full: 'Español', flag: '🇪🇸' },
      it: { short: 'IT', full: 'Italiano', flag: '🇮🇹' }
    };

    this.currentLangIndex = 0;
    this.isExpanded = false;
    this.clickTimeout = null;
    this.clickCount = 0;

    this.init();
  }

  init() {
    // Get current language from HTML or localStorage
    const currentLang = document.documentElement.getAttribute('data-language') || 'en';
    this.currentLangIndex = this.languages.indexOf(currentLang);

    this.createEnhancedSwitcher();
    this.attachEventListeners();
  }

  createEnhancedSwitcher() {
    const switcher = document.querySelector('.language-switcher');
    if (!switcher) return;

    // Create new enhanced switcher HTML
    switcher.innerHTML = `
      <div class="lang-switcher-container">
        <button class="lang-toggle-btn" id="langToggleBtn" aria-label="Switch language">
          <div class="lang-indicator"></div>
          <div class="lang-options-compact">
            ${this.languages.map((lang, index) => `
              <div class="lang-option-compact ${index === this.currentLangIndex ? 'active' : ''}"
                   data-lang="${lang}" data-index="${index}">
                <span class="lang-flag-small">${this.languageNames[lang].flag}</span>
                <span class="lang-short">${this.languageNames[lang].short}</span>
              </div>
            `).join('')}
          </div>
        </button>

        <div class="lang-expanded-panel" id="langExpandedPanel">
          ${this.languages.map((lang, index) => `
            <div class="lang-option-full ${index === this.currentLangIndex ? 'selected' : ''}"
                 data-lang="${lang}" data-index="${index}">
              <span class="lang-flag-large">${this.languageNames[lang].flag}</span>
              <div class="lang-text">
                <span class="lang-code">${this.languageNames[lang].short}</span>
                <span class="lang-name">${this.languageNames[lang].full}</span>
              </div>
              <span class="lang-check">✓</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.updateIndicatorPosition();
  }

  attachEventListeners() {
    const toggleBtn = document.getElementById('langToggleBtn');
    const expandedPanel = document.getElementById('langExpandedPanel');

    if (!toggleBtn) return;

    // Handle single/double click
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.clickCount++;

      if (this.clickTimeout) {
        clearTimeout(this.clickTimeout);
      }

      this.clickTimeout = setTimeout(() => {
        if (this.clickCount === 1) {
          // Single click - cycle language
          this.cycleLang uage();
        } else if (this.clickCount >= 2) {
          // Double click - toggle expanded view
          this.toggleExpanded();
        }
        this.clickCount = 0;
      }, 250);
    });

    // Handle clicks on expanded options
    if (expandedPanel) {
      expandedPanel.querySelectorAll('.lang-option-full').forEach(option => {
        option.addEventListener('click', (e) => {
          const lang = option.dataset.lang;
          const index = parseInt(option.dataset.index);
          this.selectLanguage(lang, index);
          this.toggleExpanded();
        });
      });
    }

    // Close expanded panel when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isExpanded && !e.target.closest('.language-switcher')) {
        this.toggleExpanded();
      }
    });
  }

  cycleLanguage() {
    if (this.isExpanded) return;

    // Move to next language
    this.currentLangIndex = (this.currentLangIndex + 1) % this.languages.length;
    const newLang = this.languages[this.currentLangIndex];

    this.updateLanguage(newLang);
    this.animateTransition();
  }

  selectLanguage(lang, index) {
    this.currentLangIndex = index;
    this.updateLanguage(lang);
    this.animateTransition();
  }

  updateLanguage(lang) {
    // Update HTML lang attribute
    document.documentElement.setAttribute('data-language', lang);
    localStorage.setItem('preferred-language', lang);

    // Update active states
    document.querySelectorAll('.lang-option-compact').forEach((opt, idx) => {
      opt.classList.toggle('active', idx === this.currentLangIndex);
    });

    document.querySelectorAll('.lang-option-full').forEach((opt, idx) => {
      opt.classList.toggle('selected', idx === this.currentLangIndex);
    });

    // Dispatch custom event for i18n system
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));

    this.updateIndicatorPosition();
  }

  updateIndicatorPosition() {
    const indicator = document.querySelector('.lang-indicator');
    const activeOption = document.querySelector('.lang-option-compact.active');

    if (!indicator || !activeOption) return;

    const containerWidth = indicator.parentElement.offsetWidth;
    const optionWidth = containerWidth / 3;
    const position = this.currentLangIndex * optionWidth;

    indicator.style.transform = `translateX(${position}px)`;
  }

  animateTransition() {
    const container = document.querySelector('.lang-switcher-container');
    if (!container) return;

    container.classList.add('switching');
    setTimeout(() => container.classList.remove('switching'), 400);
  }

  toggleExpanded() {
    this.isExpanded = !this.isExpanded;
    const panel = document.getElementById('langExpandedPanel');
    const btn = document.getElementById('langToggleBtn');

    if (this.isExpanded) {
      panel.classList.add('expanded');
      btn.classList.add('expanded');
    } else {
      panel.classList.remove('expanded');
      btn.classList.remove('expanded');
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new EnhancedLanguageSwitcher());
} else {
  new EnhancedLanguageSwitcher();
}
