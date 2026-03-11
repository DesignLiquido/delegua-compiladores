export interface OpcaoesCompilacao {
    // Caminho para o arquivo .delegua de entrada
    arquivoEntrada: string;
    // Nome do binário de saída (sem extensão). Padrão: nome do arquivo de entrada.
    nomeSaida?: string;
    // Nível de otimização a ser aplicado via opt antes de compilar. Padrão: nenhum.
    otimizacao?: 'O0' | 'O1' | 'O2' | 'O3' | 'Os' | 'Oz';
    // Se verdadeiro, mantém os arquivos intermediários (.ll, .o) após a compilação.
    manterTemporarios?: boolean;
}
