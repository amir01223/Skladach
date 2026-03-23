const fs = require('fs');
const path = require('path');

const workspace = path.resolve(__dirname, '..');
const localesDir = path.join(workspace, 'locales');

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function writeJSON(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 4) + '\n', 'utf8');
}

const base = readJSON(path.join(localesDir, 'en.json'));
const localeFiles = fs.readdirSync(localesDir).filter(f => f.endsWith('.json') && f !== 'en.json');

let report = [];
for (const file of localeFiles) {
  const p = path.join(localesDir, file);
  const loc = readJSON(p);
  const missing = [];
  for (const key of Object.keys(base)) {
    if (!(key in loc)) {
      loc[key] = base[key];
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    writeJSON(p, loc);
  }
  report.push({ locale: file.replace('.json',''), added: missing.length });
}

console.log(JSON.stringify(report, null, 2));
