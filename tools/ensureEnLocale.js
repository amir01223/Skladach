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

const htmlFiles = findFiles(workspace, '.html');
const regex = /data-i18n(?:-placeholder|-title)?=\"([^\"]+)\"/g;
const allKeys = new Set();
for (const f of htmlFiles) {
  const content = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = regex.exec(content))) {
    allKeys.add(m[1]);
  }
}

const enPath = path.join(workspace, 'locales', 'en.json');
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const missing = [...allKeys].filter(k => !(k in en));

function humanize(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, ch => ch.toUpperCase())
    .replace(/\bId\b/g, 'ID');
}

if (missing.length === 0) {
  console.log('No missing keys in en.json');
  process.exit(0);
}
missing.sort();
for (const key of missing) {
  en[key] = humanize(key);
}
fs.writeFileSync(enPath, JSON.stringify(en, null, 4) + '\n', 'utf8');
console.log('Added', missing.length, 'keys to en.json');
console.log(missing.join(', '));
