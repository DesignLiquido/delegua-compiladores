# delegua-nativo

Ligações nativas para a linguagem de programação Delegua.

## Visão Geral

`delegua-nativo` fornece implementações de módulos nativos e ligações para a linguagem Delegua, permitindo acesso direto à funcionalidade do nível do sistema e operações críticas de desempenho.

## Recursos

- Sistema de módulos nativos para Delegua
- Ligações do nível do sistema
- Otimizações de desempenho para operações principais
- Integração direta com backend LLVM

### Uso e Pré-requisitos

Requer [LLVM](https://llvm.org/) (inclui `clang`, `clang++`, `opt` e `llc`).

Após instalar qualquer versão do Node.js, o Yarn pode ser instalado usando o seguinte comando:

```sh
npm i -g yarn
```

### Instalação do LLVM para Linux

O script de instalação abaixo supõe uma distribuição Linux compatível com Ubuntu e Debian:

```sh
wget https://apt.llvm.org/llvm.sh
sudo chmod +x llvm.sh
sudo ./llvm.sh 17
sudo apt-get install cmake zlib1g-dev
```

### Instalação do LLVM para Mac

```sh
# O comando abaixo supõe que o Homebrew está instalado.
brew install cmake llvm@17

echo 'export PATH="/opt/homebrew/opt/llvm@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Instalação do LLVM para Windows

Baixe o arquivo zip correspondente à versão do LLVM em [DesignLiquido/llvm-windows](https://github.com/DesignLiquido/llvm-windows/releases) e descompacte em um diretório (por exemplo, `C:\Estudos\LLVM-17.0.6-win64`).

Adicione o subdiretório `bin` à variável de ambiente `PATH` e crie uma variável de ambiente `CMAKE_PREFIX_PATH` apontando para o subdiretório `lib\cmake\llvm`:

```
PATH              → C:\Estudos\LLVM-17.0.6-win64\bin
CMAKE_PREFIX_PATH → C:\Estudos\LLVM-17.0.6-win64\lib\cmake\llvm
```

Para verificar se a instalação foi bem-sucedida:

```powershell
clang --version
clang++ --version
opt --version
llc --version
```

## Uso

Com o LLVM instalado e no `PATH`, o compilador pode ser usado diretamente via `npx`, sem necessidade de instalação global:

```sh
npx @designliquido/delegua-nativo <arquivo.delegua>
```

O compilador executa todo o pipeline automaticamente:

1. Verifica as ferramentas do toolchain (`clang`, `clang++`, `opt`, `llc`)
2. Lê o código-fonte Delégua
3. Gera a representação intermediária LLVM (arquivo `.ll`)
4. Aplica otimizações via `opt` (opcional)
5. Compila as bibliotecas nativas
6. Linka tudo e gera o binário executável
7. Remove os arquivos temporários

O binário gerado ficará no mesmo diretório do arquivo de entrada, com o mesmo nome (sem extensão).

### Opções

| Opção | Descrição |
|-------|-----------|
| `-o <nome>` | Define o nome do binário de saída |
| `--otimizar <nível>` | Aplica otimizações via `opt` antes de compilar. Níveis: `O0`, `O1`, `O2`, `O3`, `Os`, `Oz` |
| `--manter-temporarios` | Não remove os arquivos `.ll` e `.o` após a compilação |

Exemplos:

```sh
# Compilação básica
npx @designliquido/delegua-nativo meu_programa.delegua

# Com nome de saída personalizado
npx @designliquido/delegua-nativo meu_programa.delegua -o saida

# Com otimização nível 2
npx @designliquido/delegua-nativo meu_programa.delegua --otimizar O2

# Mantendo os arquivos intermediários para inspeção
npx @designliquido/delegua-nativo meu_programa.delegua --manter-temporarios
```

### Variáveis de ambiente

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `DELEGUA_DEBUG` | `true` | Exibe o LLVM IR gerado no console antes de compilar |

Exemplo:

```sh
DELEGUA_DEBUG=true npx @designliquido/delegua-nativo meu_programa.delegua
```

### Verificação do toolchain

Ao iniciar, o compilador verifica automaticamente quais ferramentas estão disponíveis no `PATH` e reporta o resultado antes de compilar:

```
▶ Verificando ferramentas do toolchain
  ✓ Clang encontrado
  ✓ Clang++ encontrado
  ✓ opt (otimizador LLVM) encontrado
  ⚠ llc (compilador estático LLVM) não encontrado (opcional)
```

Ferramentas obrigatórias ausentes (`clang`, `clang++`) cancelam a compilação imediatamente com uma mensagem de ajuda. Ferramentas opcionais ausentes (`opt`, `llc`) geram apenas um aviso.

### Executando o binário gerado

Após a compilação, execute o binário gerado diretamente:

```sh
./meu_programa
```

## Desenvolvimento

Este pacote faz parte do projeto delegua-llvm-completo. Para configuração de desenvolvimento e diretrizes de contribuição, consulte o README do projeto principal.

## Licença

Consulte o arquivo LICENSE no diretório raiz.
