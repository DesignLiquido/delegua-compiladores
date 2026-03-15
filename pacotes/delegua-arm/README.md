# delegua-arm

Compilador Delégua para binários ARM nativos, sem LLVM. Utiliza o tradutor de assembly ARM da biblioteca `@designliquido/delegua` e o toolchain GNU para montagem e linkagem.

## Pipeline de compilação

```
arquivo.delegua → Lexador → AvaliadorSintatico → TradutorAssemblyARM → arquivo.s → GNU as → arquivo.o → GNU ld → binário
```

## Plataformas alvo

| Alvo        | Descrição                              |
|-------------|----------------------------------------|
| `linux-arm` | Linux em arquitetura ARM (padrão)      |
| `android`   | Android via Android NDK                |

## Pré-requisitos

### Linux ARM (`linux-arm`)

```bash
apt install gcc-arm-linux-gnueabihf binutils-arm-linux-gnueabihf
```

Ferramentas necessárias no `PATH`:

| Ferramenta                  | Função                          |
|-----------------------------|---------------------------------|
| `arm-linux-gnueabihf-as`    | Montador GNU para ARM           |
| `arm-linux-gnueabihf-ld`    | Linker GNU para ARM             |

### Android (`android`)

Instale o [Android NDK](https://developer.android.com/ndk) e adicione o diretório `toolchains/arm-linux-androideabi-*/prebuilt/*/bin` ao `PATH`.

Ferramentas necessárias no `PATH`:

| Ferramenta                      | Função                          |
|---------------------------------|---------------------------------|
| `arm-linux-androideabi-as`      | Montador NDK para ARM           |
| `arm-linux-androideabi-ld`      | Linker NDK para ARM             |

## Instalação

```bash
npm install -g delegua-arm
# ou
yarn global add delegua-arm
```

## Uso (CLI)

```bash
npx delegua-arm <arquivo.delegua> [opções]
```

### Opções

| Opção                       | Descrição                                                     |
|-----------------------------|---------------------------------------------------------------|
| `-o <nome>`                 | Nome do binário de saída (sem extensão). Padrão: nome do arquivo de entrada. |
| `--alvo <linux-arm\|android>` | Plataforma alvo. Padrão: `linux-arm`.                       |
| `--manter-temporarios`      | Mantém os arquivos intermediários (`.s`, `.o`) após compilar. |

### Exemplos

```bash
# Compilar para Linux ARM (padrão)
npx delegua-arm programa.delegua

# Compilar com nome de saída personalizado
npx delegua-arm programa.delegua -o meu-programa

# Compilar para Android
npx delegua-arm programa.delegua --alvo android

# Inspecionar o assembly gerado sem remover os temporários
npx delegua-arm programa.delegua --manter-temporarios
```

## Uso (API)

```typescript
import { CompiladorARM } from 'delegua-arm';

const compilador = new CompiladorARM();
const resultado = await compilador.compilar({
    arquivoEntrada: 'programa.delegua',
    nomeSaida: 'programa',          // opcional
    alvo: 'linux-arm',              // opcional, padrão: 'linux-arm'
    manterTemporarios: false,       // opcional
});

if (resultado.sucesso) {
    console.log('Binário gerado em:', resultado.caminhoBinario);
} else {
    console.error('Erro:', resultado.erro);
}
```

### `OpcaoesCompilacao`

| Campo                | Tipo                        | Obrigatório | Descrição                                          |
|----------------------|-----------------------------|-------------|----------------------------------------------------|
| `arquivoEntrada`     | `string`                    | Sim         | Caminho para o arquivo `.delegua`.                 |
| `nomeSaida`          | `string`                    | Não         | Nome do binário de saída (sem extensão).           |
| `alvo`               | `'linux-arm' \| 'android'`  | Não         | Plataforma alvo. Padrão: `'linux-arm'`.            |
| `manterTemporarios`  | `boolean`                   | Não         | Preserva `.s` e `.o` após compilar.                |

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

## Comparação com `delegua-x64`

| Aspecto               | `delegua-x64`                    | `delegua-arm`                              |
|-----------------------|----------------------------------|--------------------------------------------|
| Tradutor              | `TradutorAssemblyX64`            | `TradutorAssemblyARM`                      |
| Alvos                 | `linux`, `windows`               | `linux-arm`, `android`                     |
| Montador              | `nasm -f elf64/win64`            | `arm-linux-gnueabihf-as` / `arm-linux-androideabi-as` |
| Linker                | `ld` / `gcc`                     | `arm-linux-gnueabihf-ld` / `arm-linux-androideabi-ld` |
| Arquivo intermediário | `.asm`                           | `.s`                                       |

## Licença

MIT
