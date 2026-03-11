#!/usr/bin/env node
import * as path from 'path';
import * as fs from 'fs';

import { CompiladorNativo } from './compilador-nativo';
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
║     ██████╗ ███████╗██╗     ███████╗ ██████╗ ██╗   ██╗ █████╗   ║
║     ██╔══██╗██╔════╝██║     ██╔════╝██╔════╝ ██║   ██║██╔══██╗  ║
║     ██║  ██║█████╗  ██║     █████╗  ██║  ███╗██║   ██║███████║  ║
║     ██║  ██║██╔══╝  ██║     ██╔══╝  ██║   ██║██║   ██║██╔══██║  ║
║     ██████╔╝███████╗███████╗███████╗╚██████╔╝╚██████╔╝██║  ██║  ║
║     ╚═════╝ ╚══════╝╚══════╝╚══════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝  ║
║                                                                  ║
║                   ███╗   ██╗ █████╗ ████████╗██╗██╗   ██╗ ██████╗║
║                   ████╗  ██║██╔══██╗╚══██╔══╝██║██║   ██║██╔═══██╗
║                   ██╔██╗ ██║███████║   ██║   ██║██║   ██║██║   ██║
║                   ██║╚██╗██║██╔══██║   ██║   ██║╚██╗ ██╔╝██║   ██║
║                   ██║ ╚████║██║  ██║   ██║   ██║ ╚████╔╝ ╚██████╔╝
║                   ╚═╝  ╚═══╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═══╝   ╚═════╝ ║
║                                                                  ║
║              Compilador Delégua → LLVM → Nativo                  ║
╚══════════════════════════════════════════════════════════════════╝
`;

function log(mensagem: string, cor: string = CORES.reset) {
    console.log(`${cor}${mensagem}${CORES.reset}`);
}

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
    log('Uso:', CORES.amarelo);
    log('  npx @designliquido/delegua-nativo <arquivo.delegua>', CORES.reset);
    console.log('');
    log('Opções:', CORES.amarelo);
    log('  -o <nome>              Nome do binário de saída', CORES.reset);
    log('  --otimizar <nível>     Nível de otimização: O0, O1, O2, O3, Os, Oz', CORES.reset);
    log('  --manter-temporarios   Não remove arquivos .ll e .o após compilar', CORES.reset);
    console.log('');
    log('Variáveis de ambiente:', CORES.amarelo);
    log('  DELEGUA_DEBUG=true     Exibe o LLVM IR gerado no console', CORES.reset);
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
        logErro('Consulte o README para instruções de instalação.');
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
    let otimizacao: 'O0' | 'O1' | 'O2' | 'O3' | 'Os' | 'Oz' | undefined;
    let manterTemporarios = false;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-o' && args[i + 1]) {
            nomeSaida = args[++i];
        } else if (args[i] === '--otimizar' && args[i + 1]) {
            const nivel = args[++i] as typeof otimizacao;
            if (!['O0', 'O1', 'O2', 'O3', 'Os', 'Oz'].includes(nivel)) {
                logErro(`Nível de otimização inválido: "${nivel}". Use O0, O1, O2, O3, Os ou Oz.`);
                process.exit(1);
            }
            otimizacao = nivel;
        } else if (args[i] === '--manter-temporarios') {
            manterTemporarios = true;
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
    if (otimizacao) logInfo(`Otimização: -${otimizacao}`);

    const compilador = new CompiladorNativo();
    const resultado = await compilador.compilar({
        arquivoEntrada,
        nomeSaida,
        otimizacao,
        manterTemporarios,
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
    logInfo(`Binário: ${CORES.negrito}${resultado.caminhoBinario}${CORES.reset}`);
    logInfo(`Para executar: ${CORES.negrito}./${path.relative('.', resultado.caminhoBinario!)}${CORES.reset}`);
    console.log('');
}

principal();
