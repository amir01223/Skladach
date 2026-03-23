const fs = require('fs');
const path = require('path');

const workspace = path.resolve(__dirname, '..');

function findFiles(dir, ext) {
  let out = [];
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, f.name);
    if (f.isDirectory()) out.push(...findFiles(fp, ext));
    else if (f.isFile() && fp.endsWith(ext)) out.push(fp);
  }
  return out;
}

console.log('Scanning HTML files for translation keys...');
const htmlFiles = findFiles(workspace, '.html');
const localeFiles = findFiles(path.join(workspace, 'locales'), '.json');

const allKeys = new Set();
const regex = /data-i18n(?:-placeholder|-title)?="([^"]+)"/g;

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = regex.exec(content))) {
    allKeys.add(m[1]);
  }
}

console.log('Found', allKeys.size, 'unique translation keys.');

const locales = {};
for (const lf of localeFiles) {
  const name = path.basename(lf, '.json');
  locales[name] = JSON.parse(fs.readFileSync(lf, 'utf8'));
}

for (const [name, loc] of Object.entries(locales)) {
  const missing = [...allKeys].filter(k => !(k in loc));
  console.log(`Locale ${name}: ${missing.length} missing keys`);
  if (missing.length > 0) {
    missing.forEach(k => console.log(`  - ${k}`));
  }
}

console.log('Done.');
