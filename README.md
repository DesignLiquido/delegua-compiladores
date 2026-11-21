# Compiladores de Delégua

Monorepositório com todos os compiladores completos da linguagem de programação Delégua, com o objetivo de gerar código nativo eficiente e otimizado para diversas plataformas.

## Pacotes

| Pacote | Descrição |
|--------|-----------|
| [`@designliquido/delegua-llvm`](https://github.com/DesignLiquido/delegua-llvm) | Geração de representação intermediária LLVM (IR) a partir de código Delégua |
| [`delegua-nativo`](pacotes/delegua-nativo) | Compilação completa Delégua → LLVM IR → binário nativo via Clang |
| [`delegua-x64`](pacotes/delegua-x64) | Compilação Delégua → NASM assembly → binário nativo x64, sem LLVM |
| [`delegua-arm`](pacotes/delegua-arm) | Compilação Delégua para binários ARM via GNU Assembler, sem LLVM |
| [`delegua-risc-v`](pacotes/delegua-risc-v) | Compilação Delégua para binários RISC-V via GNU Assembler, sem LLVM |
| [`delegua-wasm`](pacotes/delegua-wasm) | Compilação Delégua para WebAssembly via WAT e wat2wasm, sem LLVM |

## Pré-requisitos

- [Node.js](https://nodejs.org/pt), pelo menos a versão LTS
- [Yarn](https://yarnpkg.com/)

Os pré-requisitos adicionais variam conforme o pacote utilizado:

| Pacote | Ferramentas necessárias |
|--------|------------------------|
| `delegua-nativo` | [LLVM](https://llvm.org/) (`clang`, `clang++`; `opt` e `llc` opcionais) |
| `delegua-x64` | [NASM](https://nasm.us/) + `ld` (Linux) ou `gcc` (Windows) |
| `delegua-arm` | GNU Assembler (`as`) + `ld` para ARM |
| `delegua-risc-v` | GNU Assembler (`as`) + `ld` para RISC-V |
| `delegua-wasm` | [wat2wasm](https://github.com/WebAssembly/wabt) (`wabt`) |

## Desenvolvimento

### Estrutura do monorepo

```
pacotes/
├── delegua-nativo/         Compilador completo com toolchain Clang/LLVM
│   └── fontes/
│       ├── verificador-toolchain.ts   Detecção de ferramentas no PATH
│       ├── compilador-nativo.ts       Pipeline de compilação
│       ├── ilc.ts                     Ponto de entrada da CLI
│       └── index.ts                   Exportações da biblioteca
├── delegua-x64/            Compilador via NASM para x64, sem LLVM
│   └── fontes/
│       ├── verificador-toolchain.ts   Detecção de nasm/ld/gcc no PATH
│       ├── compilador-x64.ts          Pipeline de compilação
│       ├── ilc.ts                     Ponto de entrada da CLI
│       └── index.ts                   Exportações da biblioteca
├── delegua-arm/            Compilador via GNU Assembler para ARM, sem LLVM
│   └── fontes/
│       ├── verificador-toolchain.ts   Detecção de as/ld no PATH
│       ├── compilador-arm.ts          Pipeline de compilação
│       ├── ilc.ts                     Ponto de entrada da CLI
│       └── index.ts                   Exportações da biblioteca
├── delegua-risc-v/         Compilador via GNU Assembler para RISC-V, sem LLVM
│   └── fontes/
│       ├── verificador-toolchain.ts   Detecção de as/ld no PATH
│       ├── compilador-riscv.ts        Pipeline de compilação
│       ├── ilc.ts                     Ponto de entrada da CLI
│       └── index.ts                   Exportações da biblioteca
└── delegua-wasm/           Compilador para WebAssembly via WAT e wat2wasm
    └── fontes/
        ├── verificador-toolchain.ts   Detecção de wat2wasm no PATH
        ├── compilador-wasm.ts         Pipeline de compilação
        ├── ilc.ts                     Ponto de entrada da CLI
        └── index.ts                   Exportações da biblioteca
```

### Instalação das dependências

```sh
yarn
```

### Empacotamento

```sh
yarn empacotar
```

### Testes

```sh
yarn testes-unitarios
```

### Publicação no npm

O repositório está configurado para usar `release-it` com o plugin `@release-it-plugins/workspaces`, publicando todos os pacotes em `pacotes/*` que não estejam com `"private": true`.

#### Via script de automação (recomendado)

Execute o script na raiz do repositório:

```powershell
.\subir-versao-delegua-compiladores.ps1
```

O script:
1. Detecta ou solicita o token npm para autenticação.
2. Atualiza o repositório, instala dependências, empacota e roda os testes.
3. Solicita o OTP do npm (exigido mesmo com token do tipo *Automation* desde o endurecimento de 2025).
4. Executa `release-it --ci` passando o OTP via `NPM_CONFIG_OTP`.

#### Prévia sem publicar

```sh
yarn publicar:previa
```

#### Em CI/CD

Defina `NPM_TOKEN` e `NPM_CONFIG_OTP` no ambiente e execute:

```sh
yarn publicar:ci
```

Notas:

- Cada pacote precisa ter `name`, `version` e permissão para publicação no npm.
- O script `prepublishOnly` de cada pacote prepara o artefato antes do `npm publish`.
- O pacote raiz do monorepo não é publicado (`"npm": false` na configuração do release-it).
- O `.npmrc` na raiz referencia `${NPM_TOKEN}`; a variável deve estar definida para que o `yarn` consiga ler a configuração ao instalar dependências.

## Contribuindo

- Nomes de variáveis, comentários e documentação devem estar em português, pois o projeto é em português.
- Utilize o Yarn como gerenciador de pacotes. Não utilize o `npm` diretamente.

