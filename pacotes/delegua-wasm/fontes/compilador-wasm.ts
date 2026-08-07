import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { Lexador, AvaliadorSintatico } from '@designliquido/delegua';

import { TradutorWebAssembly } from './tradutor-webassembly';
import { verificarToolchain } from './verificador-toolchain';
import { OpcaoesCompilacao, ResultadoCompilacao } from './interfaces';

export class CompiladorWasm {
    async compilar(opcoes: OpcaoesCompilacao): Promise<ResultadoCompilacao> {
        const resultado = verificarToolchain();
        if (!resultado.sucesso) {
            const nomes = resultado.ferramentasFaltando
                .map((f) => `  • ${f.nome}: ${f.mensagemAjuda}`)
                .join('\n');
            return {
                sucesso: false,
                erro: `Ferramentas obrigatórias não encontradas no PATH:\n${nomes}`,
            };
        }

        const { arquivoEntrada, nomeSaida, manterTemporarios, gerarHost } = opcoes;
        const nomeBase = path.basename(arquivoEntrada, path.extname(arquivoEntrada));
        const nomeArquivo = nomeSaida || nomeBase;
        const diretorioSaida = path.dirname(arquivoEntrada);
        const caminhoWasm = path.join(diretorioSaida, `${nomeArquivo}.wasm`);
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

            // 3. Traduzir para WAT (WebAssembly Text Format)
            const tradutor = new TradutorWebAssembly();
            const wat = tradutor.traduzir(resultadoParse.declaracoes);

            // 4. Gravar arquivo .wat
            const caminhoWat = path.join(diretorioSaida, `${nomeArquivo}.wat`);
            fs.writeFileSync(caminhoWat, wat, 'utf-8');
            arquivosTemporarios.push(caminhoWat);

            // 5. Compilar WAT → WASM com wat2wasm
            execSync(`wat2wasm "${caminhoWat}" -o "${caminhoWasm}"`, { stdio: 'pipe' });

            // 6. Gerar arquivo host .mjs para Node.js (opcional)
            let caminhoHost: string | undefined;
            if (gerarHost) {
                const conteudoHost = tradutor.gerarArquivoHost();
                caminhoHost = path.join(diretorioSaida, `${nomeArquivo}.mjs`);
                fs.writeFileSync(caminhoHost, conteudoHost, 'utf-8');
            }

            // 7. Limpar temporários
            if (!manterTemporarios) {
                for (const arquivo of arquivosTemporarios) {
                    if (fs.existsSync(arquivo)) {
                        fs.unlinkSync(arquivo);
                    }
                }
            }

            return { sucesso: true, caminhoWasm, caminhoHost };
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
