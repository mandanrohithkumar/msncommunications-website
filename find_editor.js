const fs = require('fs');
const lines = fs.readFileSync('components/portal/admin-dashboard.tsx', 'utf8').split('\n');
lines.forEach(function(l, i) {
  if (l.indexOf('editorService') !== -1 || l.indexOf('handleSaveInline') !== -1) {
    console.log((i + 1) + ': ' + l.trim());
  }
});
