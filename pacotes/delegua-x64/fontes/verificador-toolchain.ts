import { execSync } from 'child_process';

export interface FerramentaToolchain {
    nome: string;
    comando: string;
    obrigatoria: boolean;
    plataformas: ('linux' | 'windows')[];
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
        nome: 'NASM',
        comando: 'nasm',
        obrigatoria: true,
        plataformas: ['linux', 'windows'],
        mensagemAjuda:
            'Necessário para montar o assembly gerado. ' +
            'Linux: apt install nasm  |  Windows: choco install nasm',
    },
    {
        nome: 'ld (GNU Binutils)',
        comando: 'ld',
        obrigatoria: true,
        plataformas: ['linux'],
        mensagemAjuda:
            'Necessário para linkar o objeto no Linux. ' +
            'Instale com: apt install binutils',
    },
    {
        nome: 'gcc',
        comando: 'gcc',
        obrigatoria: true,
        plataformas: ['windows'],
        mensagemAjuda:
            'Necessário para linkar o objeto no Windows. ' +
            'Instale o MinGW-w64 ou MSYS2 e certifique-se que o diretório "bin" está no PATH.',
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

export function verificarToolchain(alvo?: 'linux' | 'windows'): ResultadoVerificacao {
    const plataforma = alvo ?? (process.platform === 'win32' ? 'windows' : 'linux');
    const ferramentasDisponiveis: FerramentaToolchain[] = [];
    const ferramentasFaltando: FerramentaToolchain[] = [];
    const avisos: FerramentaToolchain[] = [];

    for (const ferramenta of FERRAMENTAS) {
        if (!ferramenta.plataformas.includes(plataforma)) {
            continue;
        }

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
