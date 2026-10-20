'use strict';
const cart = new Map();
const productGrid = document.getElementById('product-grid');
const cartCount = document.getElementById('cart-count');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const orderStatus = document.getElementById('order-status');
const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const WHATSAPP_NUMBER = '';
function money(value) { return formatter.format(value); }
function announce(message) { if (orderStatus) orderStatus.textContent = message; }
function renderCart() {
  let quantity = 0;
  let total = 0;
  for (const item of cart.values()) { quantity += item.quantity; total += item.price * item.quantity; }
  cartCount.textContent = String(quantity);
  cartTotal.textContent = money(total);
  cartItems.replaceChildren();
  if (cart.size === 0) {
    const empty = document.createElement('li');
    empty.className = 'cart-empty';
    empty.textContent = 'Seu carrinho está vazio. Escolha algo do cardápio!';
    cartItems.append(empty);
    return;
  }
  for (const item of cart.values()) {
    const row = document.createElement('li');
    row.textContent = item.name + ' × ' + item.quantity + ' — ' + money(item.price * item.quantity);
    cartItems.append(row);
  }
}
document.querySelectorAll('[data-filter]').forEach((button) => {
  button.addEventListener('click', () => {
    const selected = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach((filterButton) => {
      const active = filterButton === button;
      filterButton.classList.toggle('is-active', active);
      filterButton.setAttribute('aria-pressed', String(active));
    });
    productGrid.querySelectorAll('[data-product-card]').forEach((card) => {
      card.hidden = selected !== 'todos' && card.dataset.category !== selected;
    });
  });
});
productGrid.querySelectorAll('[data-add-to-cart]').forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('[data-product-card]');
    if (!card) return;
    const id = card.dataset.productId;
    const current = cart.get(id);
    if (current) current.quantity += 1;
    else cart.set(id, { name: card.querySelector('.product-card__name').textContent.trim(), price: Number(card.dataset.price), quantity: 1 });
    announce('Adicionado ao carrinho.');
    renderCart();
  });
});
document.getElementById('clear-cart').addEventListener('click', () => {
  cart.clear();
  renderCart();
  announce('Carrinho limpo.');
});
document.getElementById('checkout-button').addEventListener('click', () => {
  if (cart.size === 0) {
    announce('Seu carrinho está vazio. Adicione um produto antes de finalizar.');
    return;
  }
  if (!/^\\d{10,15}$/.test(WHATSAPP_NUMBER)) {
    announce('Pedido montado! Para receber pedidos reais, configure WHATSAPP_NUMBER no script.js com o número da loja.');
    return;
  }
  const lines = Array.from(cart.values()).map((item) => item.name + ' x' + item.quantity + ' — ' + money(item.price * item.quantity));
  const total = Array.from(cart.values()).reduce((sum, item) => sum + item.price * item.quantity, 0);
  const message = 'Olá! Quero fazer este pedido:\\n' + lines.join('\\n') + '\\nTotal: ' + money(total);
  window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message), '_blank', 'noopener');
});
renderCart();