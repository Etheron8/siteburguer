# siteburguer

vai ser uma landpage one page de delivery de lanches pode gerar images ou pegar do google e deixar aba de produtos

## Estrutura

- `index.html` — página e marcação
- `style.css` — estilos
- `script.js` — lógica
- `test/smoke.test.mjs` — teste de fumaça no DOM (clica nos botões de verdade)

## Testes

```bash
npm ci
npm test
```

O teste de fumaça carrega a página real em um DOM e clica nos botões. É ele
que impede que ids e seletores quebrados subam para a `main`.
