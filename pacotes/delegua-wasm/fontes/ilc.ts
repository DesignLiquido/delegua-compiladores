#!/usr/bin/env node
import * as path from 'path';
import * as fs from 'fs';

import { CompiladorWasm } from './compilador-wasm';
import { verificarToolchain } from './verificador-toolchain';

const CORES = {
    reset: '\x1b[0m',
    verde: '\x1b[32m',
    amarelo: '\x1b[33m',
    azul: '\x1b[34m',
    magenta: '\x1b[35m',
    ciano: '\x1b[36m',
    vermelho: '\x1b[31m',
    negrito: '\x1b[1m',
};

const LOGO = `
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║     ██████╗ ███████╗██╗     ███████╗ ██████╗ ██╗   ██╗ █████╗    ║
║     ██╔══██╗██╔════╝██║     ██╔════╝██╔════╝ ██║   ██║██╔══██╗   ║
║     ██║  ██║█████╗  ██║     █████╗  ██║  ███╗██║   ██║███████║   ║
║     ██║  ██║██╔══╝  ██║     ██╔══╝  ██║   ██║██║   ██║██╔══██║   ║
║     ██████╔╝███████╗███████╗███████╗╚██████╔╝╚██████╔╝██║  ██║   ║
║     ╚═════╝ ╚══════╝╚══════╝╚══════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝   ║
║                                                                  ║
║    ██╗    ██╗ █████╗ ███████╗███╗   ███╗                         ║
║    ██║    ██║██╔══██╗██╔════╝████╗ ████║                         ║
║    ██║ █╗ ██║███████║███████╗██╔████╔██║                         ║
║    ██║███╗██║██╔══██║╚════██║██║╚██╔╝██║                         ║
║    ╚███╔███╔╝██║  ██║███████║██║ ╚═╝ ██║                         ║
║     ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝                         ║
║                                                                  ║
║         Compilador Delégua → WAT → WebAssembly                   ║
╚══════════════════════════════════════════════════════════════════╝
`;

function logEtapa(etapa: string) {
    console.log(`\n${CORES.ciano}${CORES.negrito}▶ ${etapa}${CORES.reset}`);
}

function logSucesso(mensagem: string) {
    console.log(`${CORES.verde}  ✓ ${mensagem}${CORES.reset}`);
}

function logInfo(mensagem: string) {
    console.log(`${CORES.azul}  ℹ ${mensagem}${CORES.reset}`);
}

function logAviso(mensagem: string) {
    console.log(`${CORES.amarelo}  ⚠ ${mensagem}${CORES.reset}`);
}

function logErro(mensagem: string) {
    console.log(`${CORES.vermelho}  ✗ ${mensagem}${CORES.reset}`);
}

function exibirAjuda() {
    console.log(`${CORES.amarelo}Uso:${CORES.reset}`);
    console.log(`  npx delegua-wasm <arquivo.delegua>`);
    console.log('');
    console.log(`${CORES.amarelo}Opções:${CORES.reset}`);
    console.log(`  -o <nome>              Nome do arquivo de saída (sem extensão)`);
    console.log(`  --gerar-host           Gera um arquivo host .mjs para execução no Node.js`);
    console.log(`  --manter-temporarios   Não remove o arquivo .wat após compilar`);
    console.log('');
}

function verificarEReportarToolchain(): boolean {
    logEtapa('Verificando ferramentas do toolchain');

    const resultado = verificarToolchain();

    for (const ferramenta of resultado.ferramentasDisponiveis) {
        logSucesso(`${ferramenta.nome} encontrado`);
    }

    for (const ferramenta of resultado.avisos) {
        logAviso(`${ferramenta.nome} não encontrado (opcional)`);
        logAviso(`  ${ferramenta.mensagemAjuda}`);
    }

    for (const ferramenta of resultado.ferramentasFaltando) {
        logErro(`${ferramenta.nome} não encontrado`);
        logErro(`  ${ferramenta.mensagemAjuda}`);
    }

    if (!resultado.sucesso) {
        console.log('');
        logErro('Compilação cancelada. Instale as ferramentas acima e tente novamente.');
    }

    return resultado.sucesso;
}

async function principal() {
    console.log(CORES.magenta + LOGO + CORES.reset);

    const args = process.argv.slice(2);

    if (args.length === 0) {
        exibirAjuda();
        process.exit(1);
    }

    let arquivoEntrada = '';
    let nomeSaida = '';
    let manterTemporarios = false;
    let gerarHost = false;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-o' && args[i + 1]) {
            nomeSaida = args[++i];
        } else if (args[i] === '--manter-temporarios') {
            manterTemporarios = true;
        } else if (args[i] === '--gerar-host') {
            gerarHost = true;
        } else if (!arquivoEntrada) {
            arquivoEntrada = args[i];
        }
    }

    if (!arquivoEntrada) {
        logErro('Arquivo de entrada não especificado.');
        exibirAjuda();
        process.exit(1);
    }

    if (!fs.existsSync(arquivoEntrada)) {
        logErro(`Arquivo não encontrado: ${arquivoEntrada}`);
        process.exit(1);
    }

    if (!verificarEReportarToolchain()) {
        process.exit(1);
    }

    logEtapa('Iniciando compilação');
    logInfo(`Arquivo: ${arquivoEntrada}`);

    const compilador = new CompiladorWasm();
    const resultado = await compilador.compilar({
        arquivoEntrada,
        nomeSaida,
        manterTemporarios,
        gerarHost,
    });

    if (!resultado.sucesso) {
        logErro('Erro durante a compilação:');
        console.error(resultado.erro);
        process.exit(1);
    }

    console.log('');
    console.log(`${CORES.verde}${CORES.negrito}════════════════════════════════════════════════════════════════${CORES.reset}`);
    console.log(`${CORES.verde}${CORES.negrito}  ✓ Compilação concluída com sucesso!${CORES.reset}`);
    console.log(`${CORES.verde}${CORES.negrito}════════════════════════════════════════════════════════════════${CORES.reset}`);
    console.log('');
    logInfo(`WASM: ${CORES.negrito}${resultado.caminhoWasm}${CORES.reset}`);
    if (resultado.caminhoHost) {
        logInfo(`Host: ${CORES.negrito}${resultado.caminhoHost}${CORES.reset}`);
        logInfo(`Para executar: ${CORES.negrito}node ./${path.relative('.', resultado.caminhoHost)}${CORES.reset}`);
    }
    console.log('');
}

principal();
