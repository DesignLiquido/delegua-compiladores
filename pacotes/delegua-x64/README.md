# `delegua-x64`

Compilador Delégua para binários nativos x64 via NASM, sem dependência do LLVM. Toolchain mais leve que o [`delegua-nativo`](../delegua-nativo).

**Pipeline:** código Delégua → NASM assembly (`.asm`) → objeto (`.o`) → binário executável.

## Pré-requisitos

- [Node.js](https://nodejs.org/pt), pelo menos a versão LTS
- [Yarn](https://yarnpkg.com/)

### Linux

```sh
sudo apt install nasm binutils
```

### Windows

Instale o [NASM](https://nasm.us/pub/nasm/releasebuilds/?C=M;O=D) e o [MinGW-w64](https://www.mingw-w64.org/) (fornece o `gcc`). Adicione os diretórios `bin` de ambos ao `PATH`.

Para verificar:

```sh
nasm --version
ld --version    # Linux
gcc --version   # Windows
```

## Uso

```sh
npx delegua-x64 <arquivo.delegua>
```

O compilador executa o pipeline automaticamente:

1. Verifica as ferramentas do toolchain (`nasm`, `ld`/`gcc`)
2. Lê e analisa o código-fonte Delégua
3. Gera o arquivo assembly NASM (`.asm`)
4. Monta com `nasm` gerando o objeto (`.o`)
5. Linka com `ld` (Linux) ou `gcc` (Windows) gerando o binário
6. Remove os arquivos temporários

O binário gerado ficará no mesmo diretório do arquivo de entrada, com o mesmo nome (sem extensão).

## Opções

| Opção | Descrição |
|-------|-----------|
| `-o <nome>` | Define o nome do binário de saída |
| `--alvo <linux\|windows>` | Força a plataforma alvo (padrão: detectado pelo SO) |
| `--manter-temporarios` | Não remove os arquivos `.asm` e `.o` após a compilação |

Exemplos:

```sh
# Compilação básica
npx delegua-x64 meu_programa.delegua

# Com nome de saída personalizado
npx delegua-x64 meu_programa.delegua -o saida

# Mantendo os arquivos intermediários para inspeção do assembly
npx delegua-x64 meu_programa.delegua --manter-temporarios
```

## Verificação do toolchain

Ao iniciar, o compilador verifica automaticamente quais ferramentas estão disponíveis no `PATH`:

```
▶ Verificando ferramentas do toolchain
  ✓ NASM encontrado
  ✓ ld (GNU Binutils) encontrado
```

Ferramentas ausentes cancelam a compilação com uma mensagem de ajuda sobre como instalá-las.

## Executando o binário gerado

```sh
./meu_programa
```

## Estrutura do pacote

```
fontes/
├── index.ts                   Exportações da biblioteca
├── ilc.ts                     Ponto de entrada da CLI
├── compilador-x64.ts          Pipeline de compilação
├── tradutor-assembly-x64.ts   Tradutor Delégua -> NASM x64
├── verificador-toolchain.ts   Detecção de nasm/ld/gcc no PATH
├── interfaces/
│   ├── index.ts
│   ├── opcoes-compilacao-interface.ts
│   └── resultado-compilacao-interface.ts
└── x64/                       Pipeline interno do tradutor: lowering (AST -> IR),
    ├── tipos-x64.ts           construção/destruição de SSA, alocação de registradores
    ├── ir.ts                  e geração de código. Ver issue delegua/delegua#1400
    ├── lowering.ts            para o desenho completo.
    ├── dominancia.ts
    ├── ssa.ts
    ├── liveness.ts
    ├── alocador-registradores.ts
    ├── dessa.ts
    └── codegen.ts
```

Todo o pipeline de tradução (`tradutor-assembly-x64.ts` e `x64/`) vive neste pacote — ele não depende de `@designliquido/delegua` para gerar assembly, apenas para o lexador/analisador sintático (`Lexador`, `AvaliadorSintatico`) e para os tipos de AST (`construtos`, `declaracoes`).

## Comparação com `delegua-nativo`

| | `delegua-nativo` | `delegua-x64` |
|---|---|---|
| Intermediário | LLVM IR (`.ll`) | NASM assembly (`.asm`) |
| Montador/compilador | `clang++` | `nasm` + `ld`/`gcc` |
| Otimizações | Sim (`O0`–`Oz` via `opt`) | Não |
| Dependência | LLVM + Clang (pesado) | NASM + binutils (leve) |
