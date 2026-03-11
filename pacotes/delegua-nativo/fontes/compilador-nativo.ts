import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { CompiladorLLVM } from '@designliquido/delegua-llvm';

import { verificarToolchain } from './verificador-toolchain';
import { OpcaoesCompilacao, ResultadoCompilacao } from './interfaces';

function obterArquivosC(diretorio: string): string[] {
    const arquivos: string[] = [];

    if (!fs.existsSync(diretorio)) {
        return arquivos;
    }

    for (const item of fs.readdirSync(diretorio)) {
        const caminhoCompleto = path.join(diretorio, item);
        const stat = fs.statSync(caminhoCompleto);

        if (stat.isFile() && item.endsWith('.c')) {
            arquivos.push(caminhoCompleto);
        } else if (stat.isDirectory()) {
            arquivos.push(...obterArquivosC(caminhoCompleto));
        }
    }

    return arquivos;
}

export class CompiladorNativo {
    async compilar(opcoes: OpcaoesCompilacao): Promise<ResultadoCompilacao> {
        const resultado = verificarToolchain();
        if (!resultado.sucesso) {
            const nomes = resultado.ferramentasFaltando.map((f) => `  • ${f.nome}: ${f.mensagemAjuda}`).join('\n');
            return {
                sucesso: false,
                erro: `Ferramentas obrigatórias não encontradas no PATH:\n${nomes}`,
            };
        }

        const { arquivoEntrada, nomeSaida, otimizacao, manterTemporarios } = opcoes;
        const nomeBase = path.basename(arquivoEntrada, path.extname(arquivoEntrada));
        const sufixoBinario = process.platform === 'win32' ? '.exe' : '';
        const nomeBinario = (nomeSaida || nomeBase) + sufixoBinario;
        const diretorioSaida = path.dirname(arquivoEntrada);
        const caminhoBinario = path.join(diretorioSaida, nomeBinario);
        const arquivosTemporarios: string[] = [];

        try {
            // Geração do LLVM IR
            const conteudo = fs.readFileSync(arquivoEntrada, 'utf-8');
            const codigo = conteudo.split('\n');

            const compiladorLlvm = new CompiladorLLVM();
            let ir = await compiladorLlvm.compilar(codigo);

            let irPath = path.join(diretorioSaida, `${nomeBase}.ll`);
            fs.writeFileSync(irPath, ir);
            arquivosTemporarios.push(irPath);

            // Otimização opcional via opt
            if (otimizacao) {
                const irOtimizadoPath = path.join(diretorioSaida, `${nomeBase}.otimizado.ll`);
                execSync(`opt -S -${otimizacao} "${irPath}" -o "${irOtimizadoPath}"`, { stdio: 'pipe' });
                arquivosTemporarios.push(irOtimizadoPath);
                irPath = irOtimizadoPath;
            }

            // Compilação das bibliotecas nativas
            const bibliotecasDir = path.join(__dirname, 'bibliotecas');
            const arquivosC = obterArquivosC(bibliotecasDir);
            const arquivosObj: string[] = [];

            for (const arquivoC of arquivosC) {
                const nomeArquivo = path.basename(arquivoC, '.c');
                const objPath = path.join(diretorioSaida, `${nomeArquivo}.o`);
                execSync(`clang -c "${arquivoC}" -o "${objPath}"`, { stdio: 'pipe' });
                arquivosObj.push(objPath);
                arquivosTemporarios.push(objPath);
            }

            // Linkagem final
            const objetosStr = arquivosObj.map((o) => `"${o}"`).join(' ');
            execSync(`clang++ "${irPath}" ${objetosStr} -o "${caminhoBinario}"`, { stdio: 'pipe' });

            if (!manterTemporarios) {
                for (const arquivo of arquivosTemporarios) {
                    if (fs.existsSync(arquivo)) {
                        fs.unlinkSync(arquivo);
                    }
                }
            }

            return { sucesso: true, caminhoBinario };
        } catch (erro: any) {
            if (!manterTemporarios) {
                for (const arquivo of arquivosTemporarios) {
                    if (fs.existsSync(arquivo)) {
                        fs.unlinkSync(arquivo);
                    }
                }
            }
            return { sucesso: false, erro: erro.message || String(erro) };
        }
    }
}
