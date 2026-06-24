import { readFileSync } from 'node:fs';

const analysisSource = readFileSync('src/views/AnalysisView.tsx', 'utf8');
const mockSource = readFileSync('src/data/mock.ts', 'utf8');
const constitutionSubtitle =
  '面向中医健康追踪场景提供专属的主题分析。全局视角洞察患者中医体质分布现状与演变趋势。';
const multiSourceTrackingNote = '融合院内及随访、体检系统等多源系统回流追踪数据';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function extractArray(source, exportName) {
  const match = source.match(new RegExp(`export const ${exportName} = (\\[[\\s\\S]*?\\]);`));
  assert(match, `Cannot find ${exportName}`);
  return Function(`return ${match[1]}`)();
}

function hexLightness(hex) {
  const normalized = hex.replace('#', '');
  const r = Number.parseInt(normalized.slice(0, 2), 16) / 255;
  const g = Number.parseInt(normalized.slice(2, 4), 16) / 255;
  const b = Number.parseInt(normalized.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return ((max + min) / 2) * 100;
}

const trendData = extractArray(mockSource, 'constitutionTrendData');
const constitutionKeys = Object.keys(trendData[0]).filter((key) => key !== 'month');
const variedSeries = constitutionKeys.filter((key) => {
  const values = trendData.map((item) => Number(item[key]));
  return Math.max(...values) - Math.min(...values) >= 1000;
});

assert(
  analysisSource.includes(constitutionSubtitle),
  'Expected constitution analysis subtitle to include scenario-specific theme analysis copy',
);

assert(
  /from ['"]@\/components\/ui\/tabs['"]/.test(analysisSource),
  'Expected AnalysisView to use shadcn Tabs',
);

assert(
  /from ['"]@\/components\/ui\/select['"]/.test(analysisSource),
  'Expected AnalysisView to use shadcn Select',
);

assert(
  !/<(?:button|select|table)\b/.test(analysisSource),
  'Expected AnalysisView to avoid native button, select, and table elements',
);

assert(
  analysisSource.includes(`const multiSourceTrackingNote = '${multiSourceTrackingNote}';`),
  'Expected multi-source tracking note copy to be defined in AnalysisView',
);

const sourceNoteMatches = analysisSource.match(/{multiSourceTrackingNote}/g) ?? [];
assert(
  sourceNoteMatches.length === 4,
  `Expected multi-source tracking note on 4 constitution modules, got ${sourceNoteMatches.length}`,
);

assert(
  variedSeries.length >= 5,
  `Expected at least 5 constitution series with >=1000 range, got ${variedSeries.length}`,
);

assert(
  analysisSource.includes('chartTooltipWrapperStyle') &&
    analysisSource.includes('zIndex: 30') &&
    analysisSource.includes('wrapperStyle={chartTooltipWrapperStyle}'),
  'Expected chart tooltip wrapper z-index style to be applied',
);

const colorMatch = analysisSource.match(/const COLORS = (\[[^\]]+\]);/);
assert(colorMatch, 'Cannot find COLORS palette');
const colors = Function(`return ${colorMatch[1]}`)();
const darkColors = colors.filter((color) => hexLightness(color) < 45);

assert(
  darkColors.length <= 1,
  `Expected brighter stacked-bar palette, found dark colors: ${darkColors.join(', ')}`,
);

const matrixStart = analysisSource.indexOf('{/* Matrix Table */}');
assert(matrixStart >= 0, 'Cannot find transition matrix section');
const matrixEnd = analysisSource.indexOf('<TabsContent value="tracking"', matrixStart);
assert(matrixEnd > matrixStart, 'Cannot find transition matrix section end');
const matrixSegment = analysisSource.slice(matrixStart, matrixEnd);

assert(
  matrixSegment.includes('min-h-[520px]'),
  'Expected transition matrix card to reserve enough height',
);
assert(
  !matrixSegment.includes('overflow-auto') && !matrixSegment.includes('overflow-y-auto'),
  'Expected transition matrix to avoid internal vertical scrolling',
);

[
  "type TransitionTone = 'positive' | 'negative' | 'neutral';",
  'const positiveTransitionRules: Record<string, string[]> = {',
  "湿热质: ['痰湿质', '气虚质']",
  "痰湿质: ['气虚质']",
  "阳虚质: ['气虚质']",
  "阴虚质: ['气虚质']",
  "血瘀质: ['气虚质']",
  "气郁质: ['气虚质']",
  'const negativeTransitionRules: Record<string, string[]> = {',
  "气虚质: ['阳虚质', '痰湿质', '血瘀质']",
  "阳虚质: ['痰湿质']",
  "痰湿质: ['湿热质', '血瘀质']",
  "气郁质: ['血瘀质', '湿热质']",
  "阴虚质: ['湿热质']",
  "血瘀质: ['湿热质']",
  "特禀质: ['湿热质', '痰湿质', '血瘀质']",
  'const getTransitionTone = (previous: string, current: string): TransitionTone => {',
  "if (previous === current) return 'neutral';",
  'if (positiveTransitionRules[previous]?.includes(current)) return \'positive\';',
  'if (negativeTransitionRules[previous]?.includes(current)) return \'negative\';',
  "if (previous === '平和质' && current !== '平和质') return 'negative';",
  "if (previous !== '平和质' && current === '平和质') return 'positive';",
  "positive: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100'",
  "negative: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-100'",
].forEach((expected) => {
  assert(analysisSource.includes(expected), `Expected matrix transition tone implementation: ${expected}`);
});

[
  'const tone = getTransitionTone(row.prev, c.name);',
  'transitionToneClasses[tone]',
].forEach((expected) => {
  assert(matrixSegment.includes(expected), `Expected matrix cells to use transition tone implementation: ${expected}`);
});
