export interface OpcaoesCompilacao {
    /** Caminho para o arquivo .delegua de entrada. */
    arquivoEntrada: string;
    /** Nome do binário de saída (sem extensão). Padrão: nome do arquivo de entrada. */
    nomeSaida?: string;
    /** Plataforma alvo. Padrão: detectado pelo SO em execução. */
    alvo?: 'linux' | 'windows';
    /** Se verdadeiro, mantém os arquivos intermediários (.asm, .o) após a compilação. */
    manterTemporarios?: boolean;
}
