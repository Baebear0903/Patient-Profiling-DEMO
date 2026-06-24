import { readFileSync } from 'node:fs';

const layoutSource = readFileSync('src/components/Layout.tsx', 'utf8');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(layoutSource.includes("const brandLogoColor = '#0080A2'"), 'Logo theme color must be #0080A2');
assert(layoutSource.includes('function TcmPortraitLogo()'), 'Layout must render a custom TCM portrait logo');
assert(layoutSource.includes('aria-label="中医画像标签"'), 'Logo wrapper needs an accessible label');
assert(!layoutSource.includes(', User,'), 'Logo should not use the generic User icon import');
assert(layoutSource.includes('中医画像</title>'), 'Logo SVG should identify the TCM portrait concept');
assert(
  layoutSource.includes('group-data-[collapsible=icon]:justify-center'),
  'Collapsed sidebar header must center the logo',
);
assert(
  layoutSource.includes('group-data-[collapsible=icon]:px-0'),
  'Collapsed sidebar header must remove horizontal padding',
);
assert(
  layoutSource.includes('group-data-[collapsible=icon]:hidden'),
  'Collapsed sidebar must hide the brand text',
);
assert(
  layoutSource.includes('group-data-[collapsible=icon]:mx-auto'),
  'Collapsed sidebar menu buttons must center their icons',
);
assert(layoutSource.includes('aria-label={item.label}'), 'Collapsed icon-only menu buttons need accessible labels');
assert(
  layoutSource.includes("aria-label={state === 'expanded'"),
  'Sidebar trigger needs a state-dependent accessible label',
);
assert(layoutSource.includes("'折叠侧边栏'"), 'Expanded sidebar trigger must announce collapse');
assert(layoutSource.includes("'展开侧边栏'"), 'Collapsed sidebar trigger must announce expansion');
