import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { Lexador, AvaliadorSintatico } from '@designliquido/delegua';

import { TradutorAssemblyX64 } from './tradutor-assembly-x64';
import { verificarToolchain } from './verificador-toolchain';
import { OpcaoesCompilacao, ResultadoCompilacao } from './interfaces';

export class CompiladorX64 {
    async compilar(opcoes: OpcaoesCompilacao): Promise<ResultadoCompilacao> {
        const alvo = opcoes.alvo ?? (process.platform === 'win32' ? 'windows' : 'linux');

        const resultado = verificarToolchain(alvo);
        if (!resultado.sucesso) {
            const nomes = resultado.ferramentasFaltando
                .map((f) => `  • ${f.nome}: ${f.mensagemAjuda}`)
                .join('\n');
            return {
                sucesso: false,
                erro: `Ferramentas obrigatórias não encontradas no PATH:\n${nomes}`,
            };
        }

        const { arquivoEntrada, nomeSaida, manterTemporarios } = opcoes;
        const nomeBase = path.basename(arquivoEntrada, path.extname(arquivoEntrada));
        const sufixoBinario = alvo === 'windows' ? '.exe' : '';
        const nomeBinario = (nomeSaida || nomeBase) + sufixoBinario;
        const diretorioSaida = path.dirname(arquivoEntrada);
        const caminhoBinario = path.join(diretorioSaida, nomeBinario);
        const arquivosTemporarios: string[] = [];

        try {
            // 1. Ler e lexar o fonte
            const conteudo = fs.readFileSync(arquivoEntrada, 'utf-8');
            const linhas = conteudo.split('\n');

            const lexador = new Lexador();
            const resultadoLex = lexador.mapear(linhas, -1);

            if (resultadoLex.erros && resultadoLex.erros.length > 0) {
                const msgs = resultadoLex.erros.map((e: any) => String(e)).join('\n');
                return { sucesso: false, erro: `Erros léxicos:\n${msgs}` };
            }

            // 2. Analisar sintaticamente
            const avaliador = new AvaliadorSintatico();
            const resultadoParse = await avaliador.analisar(resultadoLex, -1);

            if (resultadoParse.erros && resultadoParse.erros.length > 0) {
                const msgs = resultadoParse.erros.map((e: any) => String(e)).join('\n');
                return { sucesso: false, erro: `Erros sintáticos:\n${msgs}` };
            }

            // 3. Traduzir para NASM
            const tradutor = new TradutorAssemblyX64(alvo);
            const assembly = tradutor.traduzir(resultadoParse.declaracoes);

            // 4. Gravar arquivo .asm
            const caminhoAsm = path.join(diretorioSaida, `${nomeBase}.asm`);
            fs.writeFileSync(caminhoAsm, assembly, 'utf-8');
            arquivosTemporarios.push(caminhoAsm);

            // 5. Montar com NASM
            const caminhoObj = path.join(diretorioSaida, `${nomeBase}.o`);
            const formatoNasm = alvo === 'windows' ? 'win64' : 'elf64';
            execSync(`nasm -f ${formatoNasm} "${caminhoAsm}" -o "${caminhoObj}"`, { stdio: 'pipe' });
            arquivosTemporarios.push(caminhoObj);

            // 6. Linkar
            if (alvo === 'linux') {
                execSync(`ld "${caminhoObj}" -o "${caminhoBinario}"`, { stdio: 'pipe' });
            } else {
                execSync(`gcc "${caminhoObj}" -o "${caminhoBinario}"`, { stdio: 'pipe' });
            }

            // 7. Limpar temporários
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

            // Capturar stderr do processo externo quando disponível
            const mensagem =
                erro.stderr?.toString().trim() ||
                erro.stdout?.toString().trim() ||
                erro.message ||
                String(erro);

            return { sucesso: false, erro: mensagem };
        }
    }
}
