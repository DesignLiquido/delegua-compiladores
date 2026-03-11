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
        nome: 'Clang',
        comando: 'clang',
        obrigatoria: true,
        mensagemAjuda:
            'Necessário para compilar as bibliotecas nativas. ' +
            'Instale o LLVM e certifique-se que o diretório "bin" está no PATH.',
    },
    {
        nome: 'Clang++',
        comando: 'clang++',
        obrigatoria: true,
        mensagemAjuda:
            'Necessário para linkar o binário final. ' +
            'Instale o LLVM e certifique-se que o diretório "bin" está no PATH.',
    },
    {
        nome: 'opt (otimizador LLVM)',
        comando: 'opt',
        obrigatoria: false,
        mensagemAjuda:
            'Opcional. Necessário apenas para aplicar otimizações ao código LLVM IR. ' +
            'Instale o LLVM para habilitá-lo.',
    },
    {
        nome: 'llc (compilador estático LLVM)',
        comando: 'llc',
        obrigatoria: false,
        mensagemAjuda:
            'Opcional. Necessário para gerar assembly ou código objeto a partir do LLVM IR. ' +
            'Instale o LLVM para habilitá-lo.',
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

export function verificarFerramentaDisponivel(comando: string): boolean {
    const ferramenta = FERRAMENTAS.find((f) => f.comando === comando);
    if (!ferramenta) {
        return false;
    }
    return verificarFerramenta(ferramenta);
}
