const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// Map original hardcoded classes to dynamic theme variables
const replacements = {
  // Backgrounds
  'bg-gray-950': 'bg-bg-base',
  'bg-gray-900': 'bg-bg-surface',
  'bg-gray-800': 'bg-bg-elevated',
  'bg-gray-700': 'bg-bg-element',
  'bg-gray-600': 'bg-bg-element-hover',
  'bg-white/5': 'bg-black/5', // This is generic but contextually helps glassmorphism or hover states

  // Texts
  'text-white': 'text-text-main',
  'text-gray-400': 'text-text-sub',
  'text-gray-500': 'text-text-muted',

  // Borders
  'border-gray-800': 'border-border-line',
  'border-gray-700': 'border-border-focus',
  'border-white/10': 'border-border-line', // Generic lines or dividers
  'border-white/5': 'border-border-line',
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      // Replace keys in order of length (longest first to avoid overlapping partial replacements, though not strictly an issue here since they are exact classes)
      Object.entries(replacements).forEach(([oldClass, newClass]) => {
        // Regex to match whole words/classes to avoid replacing partials (e.g. text-white/50)
        // Note: we're ignoring alpha suffixes like text-white/50 unless they are explicitly mapped
        const regex = new RegExp(`(?<![\\w-])(${oldClass.replace(/[/.]/g, '\\$&')})(?![\\w-]|/[\\d.]+)`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, newClass);
          modified = true;
        }
      });

      if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Migration complete!');
