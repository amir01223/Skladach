// fix.js
const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');

// قراءة الملف
let content = fs.readFileSync(serverPath, 'utf8');

console.log('🔍 البحث عن الأخطاء النحوية...');

// إصلاح جميع backticks - إزالة الرموز \ الزائدة
content = content.replace(/\\\\`/g, '`');
content = content.replace(/const sql = \\\\`/g, 'const sql = `');
content = content.replace(/console.log\(\\\\`/g, 'console.log(`');

// حفظ الملف المُصلح
fs.writeFileSync(serverPath, content, 'utf8');
console.log('✅ server.js تم إصلاحه بنجاح!');
console.log('🎯 الآن جرب: node server.js');