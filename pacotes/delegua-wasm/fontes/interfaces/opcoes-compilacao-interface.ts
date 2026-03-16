export interface OpcaoesCompilacao {
    /** Caminho para o arquivo .delegua de entrada. */
    arquivoEntrada: string;
    /** Nome do arquivo de saída (sem extensão). Padrão: nome do arquivo de entrada. */
    nomeSaida?: string;
    /** Se verdadeiro, mantém o arquivo intermediário (.wat) após a compilação. */
    manterTemporarios?: boolean;
    /** Se verdadeiro, gera um arquivo host .mjs para execução no Node.js. */
    gerarHost?: boolean;
}
