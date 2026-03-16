# delegua-wasm

Compilador Delégua para WebAssembly, sem LLVM. Utiliza o tradutor WAT da biblioteca `@designliquido/delegua` e o `wat2wasm` (WABT) para gerar binários `.wasm` portáteis.

## Pipeline de compilação

```
arquivo.delegua → Lexador → AvaliadorSintatico → TradutorWebAssembly → arquivo.wat → wat2wasm → arquivo.wasm
```

## Pré-requisitos

### WABT (WebAssembly Binary Toolkit)

| Sistema  | Comando de instalação                  |
|----------|----------------------------------------|
| Linux    | `apt install wabt`                     |
| macOS    | `brew install wabt`                    |
| npm      | `npm install -g wabt`                  |
| Windows  | `choco install wabt`                   |

Ferramenta necessária no `PATH`:

| Ferramenta  | Função                                    |
|-------------|-------------------------------------------|
| `wat2wasm`  | Compila o arquivo WAT gerado para `.wasm` |

## Instalação

```bash
npm install -g delegua-wasm
# ou
yarn global add delegua-wasm
```

## Uso (CLI)

```bash
npx delegua-wasm <arquivo.delegua> [opções]
```

### Opções

| Opção                  | Descrição                                                       |
|------------------------|-----------------------------------------------------------------|
| `-o <nome>`            | Nome do arquivo de saída (sem extensão). Padrão: nome do arquivo de entrada. |
| `--gerar-host`         | Gera um arquivo host `.mjs` para execução direta no Node.js.   |
| `--manter-temporarios` | Mantém o arquivo intermediário `.wat` após compilar.            |

### Exemplos

```bash
# Compilar para WebAssembly
npx delegua-wasm programa.delegua

# Compilar com nome de saída personalizado
npx delegua-wasm programa.delegua -o meu-programa

# Compilar e gerar host Node.js para execução imediata
npx delegua-wasm programa.delegua --gerar-host

# Inspecionar o WAT gerado sem remover os temporários
npx delegua-wasm programa.delegua --manter-temporarios
```

### Executando o WASM gerado

Sem `--gerar-host`, use qualquer runtime Wasm:

```bash
wasmtime programa.wasm
wasmer programa.wasm
```

Com `--gerar-host`, use o Node.js diretamente:

```bash
node programa.mjs
```

## Uso (API)

```typescript
import { CompiladorWasm } from 'delegua-wasm';

const compilador = new CompiladorWasm();
const resultado = await compilador.compilar({
    arquivoEntrada: 'programa.delegua',
    nomeSaida: 'programa',        // opcional
    gerarHost: true,              // opcional, gera arquivo .mjs para Node.js
    manterTemporarios: false,     // opcional
});

if (resultado.sucesso) {
    console.log('WASM gerado em:', resultado.caminhoWasm);
    if (resultado.caminhoHost) {
        console.log('Host gerado em:', resultado.caminhoHost);
    }
} else {
    console.error('Erro:', resultado.erro);
}
```

### `OpcaoesCompilacao`

| Campo                | Tipo      | Obrigatório | Descrição                                          |
|----------------------|-----------|-------------|----------------------------------------------------|
| `arquivoEntrada`     | `string`  | Sim         | Caminho para o arquivo `.delegua`.                 |
| `nomeSaida`          | `string`  | Não         | Nome do arquivo de saída (sem extensão).           |
| `gerarHost`          | `boolean` | Não         | Gera arquivo `.mjs` host para Node.js.             |
| `manterTemporarios`  | `boolean` | Não         | Preserva o arquivo `.wat` após compilar.           |

### `ResultadoCompilacao`

| Campo          | Tipo      | Descrição                                            |
|----------------|-----------|------------------------------------------------------|
| `sucesso`      | `boolean` | `true` se a compilação foi bem-sucedida.             |
| `caminhoWasm`  | `string`  | Caminho para o arquivo `.wasm` gerado.               |
| `caminhoHost`  | `string`  | Caminho para o arquivo `.mjs` host (se solicitado).  |
| `erro`         | `string`  | Mensagem de erro (se mal-sucedido).                  |

## Desenvolvimento

```bash
# Instalar dependências
yarn install

# Compilar o pacote
yarn empacotar

# Executar testes
yarn testes-unitarios

# Executar direto via ts-node
yarn executar programa.delegua
```

## Comparação com outros pacotes

| Aspecto               | `delegua-x64`         | `delegua-arm`           | `delegua-risc-v`          | `delegua-wasm`           |
|-----------------------|-----------------------|-------------------------|---------------------------|--------------------------|
| Tradutor              | `TradutorAssemblyX64` | `TradutorAssemblyARM`   | `TradutorAssemblyRISCV`   | `TradutorWebAssembly`    |
| Alvos                 | `linux`, `windows`    | `linux-arm`, `android`  | `linux-riscv64`, `linux-riscv32` | Qualquer plataforma |
| Montador/Compilador   | `nasm`                | `*-as`                  | `*-as`                    | `wat2wasm`               |
| Arquivo intermediário | `.asm`                | `.s`                    | `.s`                      | `.wat`                   |
| Saída                 | binário nativo        | binário nativo          | binário nativo            | `.wasm` portátil         |

## Licença

MIT
