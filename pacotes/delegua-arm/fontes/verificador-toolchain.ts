import { execSync } from 'child_process';

export interface FerramentaToolchain {
    nome: string;
    comando: string;
    obrigatoria: boolean;
    plataformas: ('linux-arm' | 'android')[];
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
        nome: 'arm-linux-gnueabihf-as (GNU Assembler ARM)',
        comando: 'arm-linux-gnueabihf-as',
        obrigatoria: true,
        plataformas: ['linux-arm'],
        mensagemAjuda:
            'Necessário para montar o assembly ARM gerado. ' +
            'Linux: apt install gcc-arm-linux-gnueabihf binutils-arm-linux-gnueabihf',
    },
    {
        nome: 'arm-linux-gnueabihf-ld (GNU Linker ARM)',
        comando: 'arm-linux-gnueabihf-ld',
        obrigatoria: true,
        plataformas: ['linux-arm'],
        mensagemAjuda:
            'Necessário para linkar o objeto ARM no Linux. ' +
            'Linux: apt install binutils-arm-linux-gnueabihf',
    },
    {
        nome: 'arm-linux-androideabi-as (NDK Assembler)',
        comando: 'arm-linux-androideabi-as',
        obrigatoria: true,
        plataformas: ['android'],
        mensagemAjuda:
            'Necessário para montar o assembly Android/ARM. ' +
            'Instale o Android NDK e adicione o diretório toolchain ao PATH.',
    },
    {
        nome: 'arm-linux-androideabi-ld (NDK Linker)',
        comando: 'arm-linux-androideabi-ld',
        obrigatoria: true,
        plataformas: ['android'],
        mensagemAjuda:
            'Necessário para linkar o objeto Android/ARM. ' +
            'Instale o Android NDK e adicione o diretório toolchain ao PATH.',
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

export function verificarToolchain(alvo?: 'linux-arm' | 'android'): ResultadoVerificacao {
    const plataforma = alvo ?? 'linux-arm';
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
