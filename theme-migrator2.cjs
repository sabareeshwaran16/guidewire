const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = {
  // Missing background opacity variants
  'bg-gray-800/50': 'bg-bg-elevated/50',
  'bg-gray-800/60': 'bg-bg-elevated/60',
  'bg-gray-700/50': 'bg-bg-element/50',
  'bg-gray-700/60': 'bg-bg-element/60',
  'bg-gray-400': 'bg-bg-element-hover', // Not an opacity but missed earlier
  'placeholder-gray-500': 'placeholder-text-muted',
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

      Object.entries(replacements).forEach(([oldClass, newClass]) => {
        const regex = new RegExp(oldClass.replace(/[/.]/g, '\\$&'), 'g');
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
