# delegua-nativo

Ligações nativas para a linguagem de programação Delegua.

## Visão Geral

`delegua-nativo` fornece implementações de módulos nativos e ligações para a linguagem Delegua, permitindo acesso direto à funcionalidade do nível do sistema e operações críticas de desempenho.

## Recursos

- Sistema de módulos nativos para Delegua
- Ligações do nível do sistema
- Otimizações de desempenho para operações principais
- Integração direta com backend LLVM

## Instalação

```bash
npm install delegua-nativo
```

## Uso

```bash
npx delegua-nativo ola-mundo.delegua
```

Ou via require:

```javascript
const nativo = require('delegua-nativo');
```

Ou em TypeScript:

```typescript
import * as compiladorNativo from 'delegua-nativo';
```

## Desenvolvimento

Este pacote faz parte do projeto delegua-llvm-completo. Para configuração de desenvolvimento e diretrizes de contribuição, consulte o README do projeto principal.

## Licença

Consulte o arquivo LICENSE no diretório raiz.
