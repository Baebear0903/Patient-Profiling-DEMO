const fs = require('fs');
let file = fs.readFileSync('src/views/TagManagementView.tsx', 'utf8');

file = file.replace(
  '<div className="p-3 border-t flex justify-between items-center text-[11px] text-slate-500 bg-slate-50/50 flex-shrink-0">',
  '<div className="p-3 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500 bg-slate-50/50 flex-shrink-0">'
);

fs.writeFileSync('src/views/TagManagementView.tsx', file);
