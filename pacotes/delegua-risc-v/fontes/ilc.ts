#!/usr/bin/env node
import * as path from 'path';
import * as fs from 'fs';

import { CompiladorRISCV } from './compilador-riscv';
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
║         ██████╗ ██╗███████╗ ██████╗       ██╗   ██╗             ║
║         ██╔══██╗██║██╔════╝██╔════╝       ██║   ██║             ║
║         ██████╔╝██║███████╗██║            ██║   ██║             ║
║         ██╔══██╗██║╚════██║██║            ╚██╗ ██╔╝             ║
║         ██║  ██║██║███████║╚██████╗        ╚████╔╝              ║
║         ╚═╝  ╚═╝╚═╝╚══════╝ ╚═════╝         ╚═══╝               ║
║                                                                  ║
║         Compilador Delégua → GAS → Nativo RISC-V                 ║
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
    console.log(`  npx delegua-riscv <arquivo.delegua>`);
    console.log('');
    console.log(`${CORES.amarelo}Opções:${CORES.reset}`);
    console.log(`  -o <nome>                                Nome do binário de saída`);
    console.log(`  --alvo <linux-riscv64|linux-riscv32>     Plataforma alvo (padrão: linux-riscv64)`);
    console.log(`  --manter-temporarios                     Não remove arquivos .s e .o após compilar`);
    console.log('');
}

function verificarEReportarToolchain(alvo?: 'linux-riscv64' | 'linux-riscv32'): boolean {
    logEtapa('Verificando ferramentas do toolchain');

    const resultado = verificarToolchain(alvo);

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
    let alvo: 'linux-riscv64' | 'linux-riscv32' | undefined;
    let manterTemporarios = false;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-o' && args[i + 1]) {
            nomeSaida = args[++i];
        } else if (args[i] === '--alvo' && args[i + 1]) {
            const valor = args[++i];
            if (valor !== 'linux-riscv64' && valor !== 'linux-riscv32') {
                logErro(`Alvo inválido: "${valor}". Use linux-riscv64 ou linux-riscv32.`);
                process.exit(1);
            }
            alvo = valor;
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

    if (!verificarEReportarToolchain(alvo)) {
        process.exit(1);
    }

    logEtapa('Iniciando compilação');
    logInfo(`Arquivo: ${arquivoEntrada}`);
    if (alvo) logInfo(`Alvo: ${alvo}`);

    const compilador = new CompiladorRISCV();
    const resultado = await compilador.compilar({
        arquivoEntrada,
        nomeSaida,
        alvo,
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
