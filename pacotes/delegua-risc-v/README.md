# delegua-riscv

Compilador Delégua para binários RISC-V nativos, sem LLVM. Utiliza o tradutor de assembly RISC-V da biblioteca `@designliquido/delegua` e o toolchain GNU para montagem e linkagem.

## Pipeline de compilação

```
arquivo.delegua → Lexador → AvaliadorSintatico → TradutorAssemblyRISCV → arquivo.s → GNU as → arquivo.o → GNU ld → binário
```

## Plataformas alvo

| Alvo             | Descrição                                   |
|------------------|---------------------------------------------|
| `linux-riscv64`  | Linux em arquitetura RISC-V 64-bit (padrão) |
| `linux-riscv32`  | Linux em arquitetura RISC-V 32-bit          |

## Pré-requisitos

### Linux RISC-V 64-bit (`linux-riscv64`)

```bash
apt install gcc-riscv64-linux-gnu binutils-riscv64-linux-gnu
```

Ferramentas necessárias no `PATH`:

| Ferramenta                  | Função                              |
|-----------------------------|-------------------------------------|
| `riscv64-linux-gnu-as`      | Montador GNU para RISC-V 64-bit     |
| `riscv64-linux-gnu-ld`      | Linker GNU para RISC-V 64-bit       |

### Linux RISC-V 32-bit (`linux-riscv32`)

```bash
apt install gcc-riscv32-linux-gnu binutils-riscv32-linux-gnu
```

Ferramentas necessárias no `PATH`:

| Ferramenta                  | Função                              |
|-----------------------------|-------------------------------------|
| `riscv32-linux-gnu-as`      | Montador GNU para RISC-V 32-bit     |
| `riscv32-linux-gnu-ld`      | Linker GNU para RISC-V 32-bit       |

## Instalação

```bash
npm install -g delegua-riscv
# ou
yarn global add delegua-riscv
```

## Uso (CLI)

```bash
npx delegua-riscv <arquivo.delegua> [opções]
```

### Opções

| Opção                                    | Descrição                                                     |
|------------------------------------------|---------------------------------------------------------------|
| `-o <nome>`                              | Nome do binário de saída (sem extensão). Padrão: nome do arquivo de entrada. |
| `--alvo <linux-riscv64\|linux-riscv32>`  | Plataforma alvo. Padrão: `linux-riscv64`.                     |
| `--manter-temporarios`                   | Mantém os arquivos intermediários (`.s`, `.o`) após compilar. |

### Exemplos

```bash
# Compilar para Linux RISC-V 64-bit (padrão)
npx delegua-riscv programa.delegua

# Compilar com nome de saída personalizado
npx delegua-riscv programa.delegua -o meu-programa

# Compilar para RISC-V 32-bit
npx delegua-riscv programa.delegua --alvo linux-riscv32

# Inspecionar o assembly gerado sem remover os temporários
npx delegua-riscv programa.delegua --manter-temporarios
```

## Uso (API)

```typescript
import { CompiladorRISCV } from 'delegua-riscv';

const compilador = new CompiladorRISCV();
const resultado = await compilador.compilar({
    arquivoEntrada: 'programa.delegua',
    nomeSaida: 'programa',            // opcional
    alvo: 'linux-riscv64',            // opcional, padrão: 'linux-riscv64'
    manterTemporarios: false,         // opcional
});

if (resultado.sucesso) {
    console.log('Binário gerado em:', resultado.caminhoBinario);
} else {
    console.error('Erro:', resultado.erro);
}
```

### `OpcaoesCompilacao`

| Campo                | Tipo                                  | Obrigatório | Descrição                                          |
|----------------------|---------------------------------------|-------------|----------------------------------------------------|
| `arquivoEntrada`     | `string`                              | Sim         | Caminho para o arquivo `.delegua`.                 |
| `nomeSaida`          | `string`                              | Não         | Nome do binário de saída (sem extensão).           |
| `alvo`               | `'linux-riscv64' \| 'linux-riscv32'`  | Não         | Plataforma alvo. Padrão: `'linux-riscv64'`.        |
| `manterTemporarios`  | `boolean`                             | Não         | Preserva `.s` e `.o` após compilar.                |

### `ResultadoCompilacao`

| Campo            | Tipo      | Descrição                                       |
|------------------|-----------|-------------------------------------------------|
| `sucesso`        | `boolean` | `true` se a compilação foi bem-sucedida.        |
| `caminhoBinario` | `string`  | Caminho para o binário gerado (se bem-sucedido).|
| `erro`           | `string`  | Mensagem de erro (se mal-sucedido).             |

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

| Aspecto               | `delegua-x64`                    | `delegua-arm`                                   | `delegua-riscv`                                     |
|-----------------------|----------------------------------|-------------------------------------------------|-----------------------------------------------------|
| Tradutor              | `TradutorAssemblyX64`            | `TradutorAssemblyARM`                           | `TradutorAssemblyRISCV`                             |
| Alvos                 | `linux`, `windows`               | `linux-arm`, `android`                          | `linux-riscv64`, `linux-riscv32`                    |
| Montador              | `nasm -f elf64/win64`            | `arm-linux-gnueabihf-as` / `arm-linux-androideabi-as` | `riscv64-linux-gnu-as` / `riscv32-linux-gnu-as` |
| Linker                | `ld` / `gcc`                     | `arm-linux-gnueabihf-ld` / `arm-linux-androideabi-ld` | `riscv64-linux-gnu-ld` / `riscv32-linux-gnu-ld` |
| Arquivo intermediário | `.asm`                           | `.s`                                            | `.s`                                                |

## Licença

MIT
