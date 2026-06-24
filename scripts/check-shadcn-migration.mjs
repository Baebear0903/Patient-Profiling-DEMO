import fs from 'node:fs';
import path from 'node:path';

const roots = ['src/views', 'src/components'];
const nativeTags = ['button', 'input', 'select', 'textarea', 'table'];
const nativeControlExceptions = new Map([
  [
    'src/components/common/common-components.test.tsx',
    new Map([
      ['button', 'test fixtures verify trigger composition and submit semantics'],
      ['table', 'test fixtures verify DataTableShell table composition'],
    ]),
  ],
]);
const legacyNavigationTextExceptions = new Map([
  [
    'src/views/PopulationView.test.tsx',
    'regression assertion verifies legacy appNavigate is absent',
  ],
  [
    'src/views/WarningManagementView.test.tsx',
    'regression assertion verifies legacy appNavigate is absent',
  ],
]);

function collectTsxFiles(root) {
  return fs.readdirSync(root, {recursive: true})
    .filter((file) => file.endsWith('.tsx'))
    .map((file) => path.join(root, file));
}

const files = roots.flatMap(collectTsxFiles);
const violations = [];

for (const file of files) {
  if (file.includes(`${path.sep}ui${path.sep}`)) continue;

  const source = fs.readFileSync(file, 'utf8');
  const normalizedFile = file.split(path.sep).join('/');
  const exceptions = nativeControlExceptions.get(normalizedFile);

  for (const tag of nativeTags) {
    if (new RegExp(`<${tag}\\b`).test(source) && !exceptions?.has(tag)) {
      violations.push(`${normalizedFile}: native <${tag}> remains`);
    }
  }

  if (
    source.includes('appNavigate') &&
    !legacyNavigationTextExceptions.has(normalizedFile)
  ) {
    violations.push(`${normalizedFile}: appNavigate remains`);
  }
}

if (violations.length > 0) {
  console.error(violations.join('\n'));
  process.exit(1);
}

console.log('shadcn migration guard passed');
