export interface ResultadoCompilacao {
    sucesso: boolean;
    caminhoWasm?: string;
    caminhoHost?: string;
    erro?: string;
}
