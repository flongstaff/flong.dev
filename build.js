#!/usr/bin/env node

/**
 * Build script for flong.dev
 * Extracts inline JavaScript, minifies files, and creates optimized production build
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

// Configuration
const SRC_DIR = __dirname;
const DIST_DIR = path.join(__dirname, 'dist');
const SRC_HTML = path.join(SRC_DIR, 'index.html');
const DIST_HTML = path.join(DIST_DIR, 'index.html');

// Ensure dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

// Also create dist/src/i18n directory
if (!fs.existsSync(path.join(DIST_DIR, 'src', 'i18n'))) {
  fs.mkdirSync(path.join(DIST_DIR, 'src', 'i18n'), { recursive: true });
}

async function extractAndMinifyScripts() {
  console.log('📦 Building flong.dev...\n');

  // Read the HTML file
  const html = fs.readFileSync(SRC_HTML, 'utf-8');

  // Extract inline scripts
  const scriptRegex = /<script>([\s\S]*?)<\/script>/g;
  let match;
  let scriptIndex = 0;
  let modifiedHtml = html;
  const scripts = [];

  // Find all inline scripts (excluding external scripts with src= and JSON-LD)
  const inlineScriptRegex = /<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/g;

  while ((match = inlineScriptRegex.exec(html)) !== null) {
    const fullMatch = match[0];
    const scriptContent = match[1].trim();

    // Skip if it has src attribute or is JSON-LD
    if (fullMatch.includes('src=') || fullMatch.includes('application/ld+json')) {
      continue;
    }

    // Only extract substantial scripts (>100 chars)
    if (scriptContent.length > 100) {
      scripts.push({
        content: scriptContent,
        index: scriptIndex++,
        match: fullMatch
      });
    }
  }

  console.log(`Found ${scripts.length} inline scripts to extract and minify\n`);

  // Process each script
  for (const script of scripts) {
    const filename = `app-${script.index}.min.js`;
    const filepath = path.join(DIST_DIR, 'src', filename);

    console.log(`⚙️  Processing ${filename}...`);

    try {
      // Minify the script
      const result = await minify(script.content, {
        compress: {
          dead_code: true,
          drop_console: false, // Keep console for debugging
          drop_debugger: true,
          pure_funcs: ['console.debug'],
        },
        mangle: {
          reserved: ['gtag', 'i18n', 'I18n'] // Don't mangle global variables
        },
        format: {
          comments: false
        }
      });

      if (result.code) {
        fs.writeFileSync(filepath, result.code);
        console.log(`   ✅ Minified: ${script.content.length} → ${result.code.length} bytes (${Math.round((1 - result.code.length / script.content.length) * 100)}% reduction)\n`);

        // Replace in HTML
        modifiedHtml = modifiedHtml.replace(
          script.match,
          `<script src="src/${filename}"></script>`
        );
      }
    } catch (error) {
      console.error(`   ❌ Error minifying ${filename}:`, error.message);
    }
  }

  // Minify i18n.js
  console.log('⚙️  Minifying i18n.js...');
  const i18nSource = fs.readFileSync(path.join(SRC_DIR, 'src', 'i18n', 'i18n.js'), 'utf-8');
  try {
    const result = await minify(i18nSource, {
      compress: {
        dead_code: true,
        drop_console: false,
        drop_debugger: true,
      },
      mangle: {
        reserved: ['I18n', 'i18n']
      },
      format: {
        comments: false
      }
    });

    if (result.code) {
      fs.writeFileSync(path.join(DIST_DIR, 'src', 'i18n', 'i18n.min.js'), result.code);
      console.log(`   ✅ Minified: ${i18nSource.length} → ${result.code.length} bytes (${Math.round((1 - result.code.length / i18nSource.length) * 100)}% reduction)\n`);

      // Update HTML reference
      modifiedHtml = modifiedHtml.replace(
        '<script src="src/i18n/i18n.js"></script>',
        '<script src="src/i18n/i18n.min.js"></script>'
      );
    }
  } catch (error) {
    console.error('   ❌ Error minifying i18n.js:', error.message);
  }

  // Write modified HTML
  fs.writeFileSync(DIST_HTML, modifiedHtml);
  console.log('✅ Build complete!\n');

  // Copy other necessary files
  console.log('📋 Copying additional files...');
  const filesToCopy = [
    'robots.txt',
    'sitemap.xml',
    '_headers',
    '_redirects',
    '404.html',
    'og-image.svg',
    '.well-known'
  ];

  for (const file of filesToCopy) {
    const srcPath = path.join(SRC_DIR, file);
    const distPath = path.join(DIST_DIR, file);

    if (fs.existsSync(srcPath)) {
      const stats = fs.statSync(srcPath);
      if (stats.isDirectory()) {
        // Copy directory recursively
        fs.cpSync(srcPath, distPath, { recursive: true });
        console.log(`   ✅ Copied ${file}/`);
      } else {
        fs.copyFileSync(srcPath, distPath);
        console.log(`   ✅ Copied ${file}`);
      }
    }
  }

  console.log('\n🎉 Build complete! Output in dist/');
  console.log(`📊 Total scripts minified: ${scripts.length + 1}`);
}

extractAndMinifyScripts().catch(console.error);
