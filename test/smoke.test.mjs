// Teste de fumaça no DOM: carrega a página real e clica nos botões.
// É o teste que impede a página de subir com ids e seletores quebrados.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { JSDOM } from 'jsdom';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

function loadPage() {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  const script = readFileSync(join(root, 'script.js'), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'outside-only' });
  dom.window.eval(script);
  return dom;
}

function press(dom, selector) {
  const button = dom.window.document.querySelector(selector);
  assert.ok(button, `botão ausente: ${selector}`);
  button.dispatchEvent(new dom.window.Event('click', { bubbles: true }));
}

function readout(dom) {
  return dom.window.document.getElementById('display').textContent.trim();
}

test('a página carrega sem erro e mostra zero', () => {
  const dom = loadPage();
  assert.equal(readout(dom), '0');
});

test('a soma funciona: 7 + 5 = 12', () => {
  const dom = loadPage();
  press(dom, '[data-number="7"]');
  press(dom, '[data-action="add"]');
  press(dom, '[data-number="5"]');
  press(dom, '[data-action="equal"]');
  assert.equal(readout(dom), '12');
});

test('a subtração funciona: 9 - 4 = 5', () => {
  const dom = loadPage();
  press(dom, '[data-number="9"]');
  press(dom, '[data-action="subtract"]');
  press(dom, '[data-number="4"]');
  press(dom, '[data-action="equal"]');
  assert.equal(readout(dom), '5');
});

test('a multiplicação funciona: 6 × 7 = 42', () => {
  const dom = loadPage();
  press(dom, '[data-number="6"]');
  press(dom, '[data-action="multiply"]');
  press(dom, '[data-number="7"]');
  press(dom, '[data-action="equal"]');
  assert.equal(readout(dom), '42');
});

test('a divisão funciona: 12 ÷ 3 = 4', () => {
  const dom = loadPage();
  press(dom, '[data-number="1"]');
  press(dom, '[data-number="2"]');
  press(dom, '[data-action="divide"]');
  press(dom, '[data-number="3"]');
  press(dom, '[data-action="equal"]');
  assert.equal(readout(dom), '4');
});

test('o AC limpa o visor', () => {
  const dom = loadPage();
  press(dom, '[data-number="8"]');
  press(dom, '[data-action="clear"]');
  assert.equal(readout(dom), '0');
});

test('os operadores não viram dígitos no visor', () => {
  const dom = loadPage();
  press(dom, '[data-number="3"]');
  press(dom, '[data-action="add"]');
  press(dom, '[data-number="2"]');
  press(dom, '[data-action="equal"]');
  assert.doesNotMatch(readout(dom), /[+\-*/]/);
});

test('divisão por zero mostra erro em vez de quebrar', () => {
  const dom = loadPage();
  press(dom, '[data-number="8"]');
  press(dom, '[data-action="divide"]');
  press(dom, '[data-number="0"]');
  press(dom, '[data-action="equal"]');
  assert.equal(readout(dom), 'Erro');
});
