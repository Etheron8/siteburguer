'use strict';

const display = document.getElementById('display');
const keys = document.querySelectorAll('.key');

const OPERATORS = {
  add: '+',
  subtract: '-',
  multiply: '*',
  divide: '/',
};

let accumulator = null;
let operator = null;
let waitingForNumber = false;

function show(value) {
  display.textContent = value;
}

function currentValue() {
  const raw = display.textContent.trim();
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function clearAll() {
  accumulator = null;
  operator = null;
  waitingForNumber = false;
  show('0');
}

function deleteLast() {
  if (waitingForNumber) {
    return;
  }
  const text = display.textContent;
  const next = text.length > 1 ? text.slice(0, -1) : '0';
  show(next);
}

function appendDigit(digit) {
  if (waitingForNumber) {
    show(digit);
    waitingForNumber = false;
    return;
  }
  show(display.textContent === '0' ? digit : display.textContent + digit);
}

function appendDecimal() {
  if (waitingForNumber) {
    show('0.');
    waitingForNumber = false;
    return;
  }
  if (!display.textContent.includes('.')) {
    show(display.textContent + '.');
  }
}

function applyPercent() {
  show(String(currentValue() / 100));
}

function compute() {
  if (operator === null || accumulator === null) {
    return null;
  }
  const operand = currentValue();
  let result;
  switch (operator) {
    case '+':
      result = accumulator + operand;
      break;
    case '-':
      result = accumulator - operand;
      break;
    case '*':
      result = accumulator * operand;
      break;
    case '/':
      result = operand === 0 ? NaN : accumulator / operand;
      break;
    default:
      return null;
  }
  return result;
}

function chooseOperator(action) {
  const symbol = OPERATORS[action];
  if (!symbol) {
    return;
  }
  if (operator !== null && !waitingForNumber) {
    const result = compute();
    if (result === null) {
      return;
    }
    accumulator = result;
    show(format(result));
  } else {
    accumulator = currentValue();
  }
  operator = symbol;
  waitingForNumber = true;
}

function format(value) {
  if (!Number.isFinite(value)) {
    return 'Erro';
  }
  return String(Math.round(value * 1e10) / 1e10);
}

function equals() {
  const result = compute();
  if (result === null) {
    return;
  }
  show(format(result));
  accumulator = result;
  operator = null;
  waitingForNumber = true;
}

keys.forEach((key) => {
  key.addEventListener('click', () => {
    const number = key.dataset.number;
    if (number !== undefined) {
      appendDigit(number);
      return;
    }
    switch (key.dataset.action) {
      case 'clear':
        clearAll();
        break;
      case 'delete':
        deleteLast();
        break;
      case 'percent':
        applyPercent();
        break;
      case 'decimal':
        appendDecimal();
        break;
      case 'equal':
        equals();
        break;
      default:
        chooseOperator(key.dataset.action);
        break;
    }
  });
});
