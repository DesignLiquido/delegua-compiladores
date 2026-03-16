export interface OpcaoesCompilacao {
    /** Caminho para o arquivo .delegua de entrada. */
    arquivoEntrada: string;
    /** Nome do binário de saída (sem extensão). Padrão: nome do arquivo de entrada. */
    nomeSaida?: string;
    /** Plataforma alvo. Padrão: linux-riscv64. */
    alvo?: 'linux-riscv64' | 'linux-riscv32';
    /** Se verdadeiro, mantém os arquivos intermediários (.s, .o) após a compilação. */
    manterTemporarios?: boolean;
}
