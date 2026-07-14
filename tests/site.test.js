import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8');

test('page has one h1 and the expected primary sections', () => {
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1);
  for (const id of ['work', 'approach', 'about', 'contact']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
});

test('portfolio uses verified public links and preferred contact email', () => {
  for (const link of [
    'github.com/dk3yyyy/football_predictor',
    'github.com/dk3yyyy/local_AI_agent',
    'github.com/dk3yyyy/tic_tac',
    'github.com/dk3yyyy/VirusTotal-Telegram-Bot',
    'github.com/dk3yyyy/sol-eth-wallet-scanner',
    'linkedin.com/in/joshua-nwachinemere',
    'volyxai.com',
  ]) assert.ok(html.includes(link), `Missing ${link}`);
  assert.ok(html.includes('josh0victor@outlook.com'));
});

test('external links opened in new tabs are protected', () => {
  const externalTargets = [...html.matchAll(/<a[^>]*target="_blank"[^>]*>/g)].map((match) => match[0]);
  assert.ok(externalTargets.length >= 6);
  for (const anchor of externalTargets) assert.match(anchor, /rel="noreferrer"/);
});

test('responsive and reduced-motion styles are present', () => {
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /:focus-visible/);
});

test('copy avoids unsupported performance metrics', () => {
  assert.doesNotMatch(html, /\b\d{1,3}%\b/);
  assert.doesNotMatch(html, /customers served|production scale|industry-leading/i);
});
