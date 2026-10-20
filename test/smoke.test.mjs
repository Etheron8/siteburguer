import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { JSDOM } from 'jsdom';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
function loadPage() {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  const script = readFileSync(join(root, 'script.js'), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'outside-only' });
  dom.window.eval(script);
  return dom;
}
test('landing page has four priced products and food images', () => {
  const dom = loadPage();
  const document = dom.window.document;
  assert.ok(document.querySelector('#produtos'));
  const cards = [...document.querySelectorAll('[data-product-card]')];
  assert.equal(cards.length, 4);
  assert.ok(cards.every((card) => card.querySelector('img[src][alt]')));
  assert.ok(cards.every((card) => /R\$\s?\d/.test(card.textContent)));
  assert.equal(document.querySelectorAll('[data-add-to-cart]').length, 4);
  dom.window.close();
});
test('category filter only shows products in selected category', () => {
  const dom = loadPage();
  dom.window.document.querySelector('[data-filter="acompanhamento"]').click();
  const cards = [...dom.window.document.querySelectorAll('[data-product-card]')];
  assert.equal(cards.filter((card) => !card.hidden).length, 1);
  assert.equal(cards.find((card) => !card.hidden).dataset.productId, 'batata-crocante');
  dom.window.close();
});
test('adding products updates cart quantity and total', () => {
  const dom = loadPage();
  const add = dom.window.document.querySelector('[data-add-to-cart="smash-classico"]');
  add.click();
  add.click();
  assert.equal(dom.window.document.querySelector('#cart-count').textContent, '2');
  assert.match(dom.window.document.querySelector('#cart-total').textContent, /49,80/);
  assert.match(dom.window.document.querySelector('#cart-items').textContent, /Smash Clássico × 2/);
  dom.window.close();
});
test('clearing cart resets quantity, total and items', () => {
  const dom = loadPage();
  dom.window.document.querySelector('[data-add-to-cart="duplo-cheddar"]').click();
  dom.window.document.querySelector('#clear-cart').click();
  assert.equal(dom.window.document.querySelector('#cart-count').textContent, '0');
  assert.match(dom.window.document.querySelector('#cart-total').textContent, /0,00/);
  assert.match(dom.window.document.querySelector('#cart-items').textContent, /carrinho está vazio/i);
  dom.window.close();
});
test('checkout does not claim a real order before WhatsApp is configured', () => {
  const dom = loadPage();
  dom.window.document.querySelector('[data-add-to-cart="smash-classico"]').click();
  dom.window.document.querySelector('#checkout-button').click();
  assert.match(dom.window.document.querySelector('#order-status').textContent, /configure WHATSAPP_NUMBER/i);
  dom.window.close();
});