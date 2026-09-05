import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Building2 } from 'lucide-react';

const require = createRequire(import.meta.url);
// Transpile the actual components in memory; no test route or fixture enters the app.
function componentModule(file, overrides = {}) {
  const output = ts.transpileModule(readFileSync(resolve(file), 'utf8'), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText.replace(/from ["']([^"']+)["']/g, (_, specifier) => {
    const target = overrides[specifier] ?? pathToFileURL(require.resolve(specifier)).href;
    return `from ${JSON.stringify(target)}`;
  });
  return `data:text/javascript;base64,${Buffer.from(output).toString('base64')}`;
}
const heading = componentModule('src/components/SectionHeading.tsx');
const { SolutionsSection } = await import(componentModule('src/components/SolutionsSection.tsx', { './SectionHeading': heading }));
// Next's bundler unwraps this CommonJS default export; native Node ESM does not.
const imageInterop = `data:text/javascript;base64,${Buffer.from(`import image from ${JSON.stringify(pathToFileURL(require.resolve('next/image')).href)}; export default image.default ?? image;`).toString('base64')}`;
const { RichContent } = await import(componentModule('src/components/RichContent.tsx', {
  '@/lib/cms-solutions': pathToFileURL(resolve('src/lib/cms-solutions.ts')).href,
  'next/image': imageInterop,
}));
const companyLogo = componentModule('src/components/CompanyLogo.tsx', { 'next/image': imageInterop });
const { FooterContent } = await import(componentModule('src/components/FooterContent.tsx', {
  './CompanyLogo': companyLogo,
  '@/lib/inquiry': pathToFileURL(resolve('src/lib/inquiry.ts')).href,
}));
const { WhatsAppButton } = await import(componentModule('src/components/WhatsAppButton.tsx'));
const render = (component, props) => renderToStaticMarkup(React.createElement(component, props));

test('compact footer renders supplied full logo, CMS contacts and real navigation', () => {
  const html = render(FooterContent, { contact: { email: 'sales@sigmacore.id', phone: '0851 5855 8791', address: 'Plaza Aminta, Jakarta Selatan' }, links: [{ label: 'Solusi', href: '/#solusi' }, { label: 'Insight', href: '/insight#insight-list' }] });
  assert.match(html, /class="site-footer"/);
  assert.match(html, /scs-full-logo.png/);
  assert.match(html, /mailto:sales@sigmacore.id/);
  assert.match(html, /tel:085158558791/);
  assert.match(html, /Plaza Aminta, Jakarta Selatan/);
  assert.match(html, /https:\/\/www\.google\.com\/maps\/search\/\?api=1&amp;query=Plaza%20Aminta%2C%20Jakarta%20Selatan/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /href="\/insight#insight-list"/);
  assert.match(html, /Hubungi Kami/);
  assert.doesNotMatch(html, /Privacy Policy|Terms of Service|href="javascript:/);
});
test('floating Hubungi Kami remains available with normalized WhatsApp destination', () => {
  const html = render(WhatsAppButton, { phone: '0851 5855 8791' });
  assert.match(html, /class="whatsapp-float"/);
  assert.match(html, /https:\/\/wa.me\/6285158558791/);
  assert.match(html, /Hubungi Kami/);
  assert.match(html, /rel="noopener noreferrer"/);
});

test('Services cards keep semantic heading, readable CTA, and detail URL', () => {
  const html = render(SolutionsSection, { solutions: [{ number: '01', slug: 'cloud', title: 'Data Center & Cloud', description: 'Ringkasan', items: ['Backup'], icon: Building2 }] });
  assert.match(html, /aria-labelledby="solutions-heading"/);
  assert.match(html, /aria-labelledby="solution-cloud"/);
  assert.match(html, /href="\/solusi\/cloud"/);
  assert.match(html, /Lihat detail solusi/);
  assert.match(html, /Data Center &amp; Cloud/);
});
test('empty CMS presents contact option, with no resurrected service cards', () => {
  const html = render(SolutionsSection, { solutions: [] });
  assert.match(html, /Informasi solusi sedang diperbarui/);
  assert.match(html, /href="#kontak"/);
  assert.doesNotMatch(html, /class="solution-card"/);
});
test('rich content renders standard formatting and rejects active HTML/unsafe links', () => {
  const html = render(RichContent, { data: { root: { children: [
    { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Detail solusi', format: 1 }] },
    { type: 'paragraph', children: [{ type: 'text', text: '<script>unsafe</script>', format: 2 }] },
    { type: 'link', fields: { url: 'javascript:alert(1)' }, children: [{ type: 'text', text: 'Tidak aktif' }] },
    { type: 'link', fields: { url: 'https://sigmacore.id', newTab: true }, children: [{ type: 'text', text: 'SCS' }] },
    { type: 'list', listType: 'number', start: 2, children: [{ type: 'listitem', children: [{ type: 'text', text: 'Langkah' }] }] },
  ] } } });
  assert.match(html, /<h2><strong>Detail solusi<\/strong><\/h2>/);
  assert.match(html, /&lt;script&gt;unsafe&lt;\/script&gt;/);
  assert.doesNotMatch(html, /javascript:|<script>/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.match(html, /<ol start="2"><li>Langkah<\/li><\/ol>/);
});
test('absent rich content renders nothing', () => {
  assert.equal(render(RichContent, { data: null }), '');
  assert.equal(render(RichContent, { data: { root: { children: [] } } }), '');
});

test('rich-text uploads resolve against the configured CMS, not an old host', () => {
  const html = render(RichContent, { mediaAPIBase: 'https://cms.example.test/api/', data: { root: { children: [
    { type: 'upload', value: { filename: 'Service Hero.png', alt: 'Data center', mimeType: 'image/png', width: 1200, height: 800, url: 'http://old-host/private' } },
  ] } } });
  assert.match(html, /src="https:\/\/cms.example.test\/api\/media\/file\/Service%20Hero.png"/);
  assert.match(html, /alt="Data center"/);
  assert.doesNotMatch(html, /old-host/);
});
