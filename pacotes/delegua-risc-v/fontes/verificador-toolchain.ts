import { execSync } from 'child_process';

export interface FerramentaToolchain {
    nome: string;
    comando: string;
    obrigatoria: boolean;
    plataformas: ('linux-riscv64' | 'linux-riscv32')[];
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
        nome: 'riscv64-linux-gnu-as (GNU Assembler RISC-V 64-bit)',
        comando: 'riscv64-linux-gnu-as',
        obrigatoria: true,
        plataformas: ['linux-riscv64'],
        mensagemAjuda:
            'Necessário para montar o assembly RISC-V 64-bit gerado. ' +
            'Linux: apt install gcc-riscv64-linux-gnu binutils-riscv64-linux-gnu',
    },
    {
        nome: 'riscv64-linux-gnu-ld (GNU Linker RISC-V 64-bit)',
        comando: 'riscv64-linux-gnu-ld',
        obrigatoria: true,
        plataformas: ['linux-riscv64'],
        mensagemAjuda:
            'Necessário para linkar o objeto RISC-V 64-bit no Linux. ' +
            'Linux: apt install binutils-riscv64-linux-gnu',
    },
    {
        nome: 'riscv32-linux-gnu-as (GNU Assembler RISC-V 32-bit)',
        comando: 'riscv32-linux-gnu-as',
        obrigatoria: true,
        plataformas: ['linux-riscv32'],
        mensagemAjuda:
            'Necessário para montar o assembly RISC-V 32-bit gerado. ' +
            'Linux: apt install gcc-riscv32-linux-gnu binutils-riscv32-linux-gnu',
    },
    {
        nome: 'riscv32-linux-gnu-ld (GNU Linker RISC-V 32-bit)',
        comando: 'riscv32-linux-gnu-ld',
        obrigatoria: true,
        plataformas: ['linux-riscv32'],
        mensagemAjuda:
            'Necessário para linkar o objeto RISC-V 32-bit no Linux. ' +
            'Linux: apt install binutils-riscv32-linux-gnu',
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

export function verificarToolchain(alvo?: 'linux-riscv64' | 'linux-riscv32'): ResultadoVerificacao {
    const plataforma = alvo ?? 'linux-riscv64';
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
