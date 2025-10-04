# Multilingual Support for flong.dev

## 🌍 Supported Languages

- **English** (en) - Default
- **Spanish** (es) - Español  
- **Italian** (it) - Italiano

## How It Works

The i18n system uses HTML data attributes to store translations directly in the markup. The JavaScript library automatically detects the user's preferred language and applies translations on page load.

### Features

✅ Automatic language detection from browser settings
✅ LocalStorage persistence of language preference
✅ SEO-friendly meta tag updates
✅ Google Analytics language tracking
✅ Smooth language switching without page reload
✅ Placeholder and aria-label translation support

## Usage

### 1. Adding Translations to HTML Elements

Use data attributes for each supported language:

```html
<h1 
  data-en="IT Systems Administrator" 
  data-es="Administrador de Sistemas IT" 
  data-it="Amministratore di Sistemi IT">
  IT Systems Administrator
</h1>
```

### 2. Translating Form Placeholders

```html
<input 
  type="text" 
  data-placeholder-en="Your name" 
  data-placeholder-es="Tu nombre" 
  data-placeholder-it="Il tuo nome"
  placeholder="Your name">
```

### 3. Translating Aria Labels

```html
<button 
  data-aria-en="Close menu" 
  data-aria-es="Cerrar menú" 
  data-aria-it="Chiudi menu"
  aria-label="Close menu">
  X
</button>
```

## API

### Switch Language Programmatically

```javascript
// Switch to Spanish
window.i18n.switchTo('es');

// Switch to Italian
window.i18n.switchTo('it');

// Get current language
const currentLang = window.i18n.getCurrentLanguage();
```

### Listen to Language Changes

```javascript
window.addEventListener('languageChanged', (e) => {
  console.log('Language changed to:', e.detail.language);
});
```

## Language Toggle Button

The language toggle button cycles through languages:
- 🇬🇧 EN → 🇪🇸 ES → 🇮🇹 IT → 🇬🇧 EN

## SEO Implementation

The system automatically updates:
- `<html lang="...">` attribute
- `<title>` tag
- Meta description
- `og:locale` for social sharing
- Canonical URLs (if needed)

## Analytics Tracking

Language changes are automatically tracked in Google Analytics:

```javascript
gtag('event', 'language_change', {
  'event_category': 'engagement',
  'event_label': 'es', // language code
  'value': 1
});
```

## Testing

1. Open the website in a browser
2. Click the language toggle button (top-right)
3. Verify translations appear correctly
4. Check that preference persists after page reload
5. Open DevTools → Application → Local Storage to see `preferred-language`

## Adding More Languages

To add a new language (e.g., French):

1. Add `data-fr="..."` attributes to HTML elements
2. Update `supportedLangs` in `i18n.js`:
   ```javascript
   this.supportedLangs = ['en', 'es', 'it', 'fr'];
   ```
3. Add translations to meta tag updates
4. Add flag emoji and language code to toggle button

## Performance

- **No external dependencies** - Pure vanilla JavaScript
- **Lightweight** - Only ~5KB minified
- **Fast** - Uses native DOM APIs
- **Cached** - Language preference stored in localStorage

## Browser Support

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Opera: ✅
- IE11: ⚠️ (requires polyfills for `closest()` and `CustomEvent`)

## Translation Status

### Fully Translated
- ✅ Headers and titles
- ✅ Service descriptions
- ✅ Project cards
- ✅ Contact form
- ✅ Experience section
- ✅ Meta tags

### Partially Translated
- ⚠️ Some paragraph content
- ⚠️ Technical terms (kept in English intentionally)

### Not Translated
- ❌ Code snippets
- ❌ Technical specifications
- ❌ URLs and links

## Contributing Translations

To improve or add translations:

1. Find the element in `index.html`
2. Add or update the `data-[lang]` attribute
3. Test the translation
4. Submit a pull request

## Troubleshooting

### Translations not applying
- Check browser console for JavaScript errors
- Verify data attributes are correctly formatted
- Clear localStorage and try again

### Wrong language detected
- Manually set language using toggle button
- Check `navigator.language` in DevTools console
- Clear `preferred-language` from localStorage

### Meta tags not updating
- Hard refresh the page (Cmd+Shift+R / Ctrl+F5)
- Check that meta tags exist in the HTML head
- Verify `updateMetaTags()` is being called

## License

Part of flong.dev portfolio - © Franco Longstaff
