import { execSync } from 'child_process';

export interface FerramentaToolchain {
    nome: string;
    comando: string;
    obrigatoria: boolean;
    mensagemAjuda: string;
}

export interface ResultadoVerificacao {
    sucesso: boolean;
    ferramentasDisponiveis: FerramentaToolchain[];
    ferramentasFaltando: FerramentaToolchain[];
    avisos: FerramentaToolchain[];
}

const FERRAMENTAS: FerramentaToolchain[] = [
    {
        nome: 'wat2wasm (WABT)',
        comando: 'wat2wasm',
        obrigatoria: true,
        mensagemAjuda:
            'Necessário para compilar o arquivo WAT gerado para WASM. ' +
            'Linux: apt install wabt  |  macOS: brew install wabt  |  npm: npm install -g wabt',
    },
];

function verificarFerramenta(ferramenta: FerramentaToolchain): boolean {
    try {
        execSync(`${ferramenta.comando} --version`, { stdio: 'pipe' });
        return true;
    } catch {
        return false;
    }
}

export function verificarToolchain(): ResultadoVerificacao {
    const ferramentasDisponiveis: FerramentaToolchain[] = [];
    const ferramentasFaltando: FerramentaToolchain[] = [];
    const avisos: FerramentaToolchain[] = [];

    for (const ferramenta of FERRAMENTAS) {
        if (verificarFerramenta(ferramenta)) {
            ferramentasDisponiveis.push(ferramenta);
        } else if (ferramenta.obrigatoria) {
            ferramentasFaltando.push(ferramenta);
        } else {
            avisos.push(ferramenta);
        }
    }

    return {
        sucesso: ferramentasFaltando.length === 0,
        ferramentasDisponiveis,
        ferramentasFaltando,
        avisos,
    };
}
