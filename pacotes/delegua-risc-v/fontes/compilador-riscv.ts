import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { Lexador, AvaliadorSintatico } from '@designliquido/delegua';
import { TradutorAssemblyRISCV, PlataformaAlvoRISCV } from '@designliquido/delegua/tradutores';

import { verificarToolchain } from './verificador-toolchain';
import { OpcaoesCompilacao, ResultadoCompilacao } from './interfaces';

export class CompiladorRISCV {
    async compilar(opcoes: OpcaoesCompilacao): Promise<ResultadoCompilacao> {
        const alvo = opcoes.alvo ?? 'linux-riscv64';

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
        const nomeBinario = nomeSaida || nomeBase;
        const diretorioSaida = path.dirname(arquivoEntrada);
        const caminhoBinario = path.join(diretorioSaida, nomeBinario);
        const arquivosTemporarios: string[] = [];

        const prefixoToolchain = alvo === 'linux-riscv32' ? 'riscv32-linux-gnu' : 'riscv64-linux-gnu';
        const alvoTradutor: PlataformaAlvoRISCV = alvo === 'linux-riscv32' ? 'linux-rv32' : 'linux-rv64';

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

            // 3. Traduzir para assembly RISC-V (GAS)
            const tradutor = new TradutorAssemblyRISCV(alvoTradutor);
            const assembly = tradutor.traduzir(resultadoParse.declaracoes);

            // 4. Gravar arquivo .s
            const caminhoAsm = path.join(diretorioSaida, `${nomeBase}.s`);
            fs.writeFileSync(caminhoAsm, assembly, 'utf-8');
            arquivosTemporarios.push(caminhoAsm);

            // 5. Montar com GNU Assembler (cross-assembler para RISC-V)
            const caminhoObj = path.join(diretorioSaida, `${nomeBase}.o`);
            execSync(`${prefixoToolchain}-as "${caminhoAsm}" -o "${caminhoObj}"`, { stdio: 'pipe' });
            arquivosTemporarios.push(caminhoObj);

            // 6. Linkar
            execSync(`${prefixoToolchain}-ld "${caminhoObj}" -o "${caminhoBinario}"`, { stdio: 'pipe' });

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

            const mensagem =
                erro.stderr?.toString().trim() ||
                erro.stdout?.toString().trim() ||
                erro.message ||
                String(erro);

            return { sucesso: false, erro: mensagem };
        }
    }
}
