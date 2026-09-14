import { Atividade } from '../../atividades/atividade.model';
import { ProgressoCargaHorariaDTO } from '../../atividades/progresso/progresso.model';
import { RelatorioAtividades } from '../../relatorio/relatorio.model';
import { SolicitacaoAvaliadorDetalhe } from '../../avaliacao/avaliacao.model';
import { RegulamentoChunk } from '../../regulamentos/regulamento.service';

export function gerarTokenMock(
  email: string,
  role: 'ESTUDANTE' | 'AVALIADOR' | 'ADMINISTRADOR',
): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: email,
      role: role,
      exp: Math.floor(Date.now() / 1000) + 86400,
    }),
  );
  return `${header}.${payload}.mock_signature`;
}

// 1. Atividades em memória
export const ATIVIDADES_MOCK: Atividade[] = [
  {
    id: 1,
    titulo: 'Monitoria Acadêmica de Algoritmos',
    instituicaoResponsavel: 'UFAPE',
    dataRealizacao: '2026-03-10',
    cargaHorariaEmHoras: 30,
    natureza: 'ACC',
    categoria: 'ENSINO',
    dataCadastro: '2026-03-11T08:00:00',
    status: 'APROVADA',
  },
  {
    id: 2,
    titulo: 'Projeto de Extensão AgroTI Comunitária',
    instituicaoResponsavel: 'UFAPE',
    dataRealizacao: '2026-04-15',
    cargaHorariaEmHoras: 60,
    natureza: 'ACEX',
    categoria: 'EXTENSAO',
    dataCadastro: '2026-04-16T10:30:00',
    status: 'PENDENTE',
  },
  {
    id: 3,
    titulo: 'Iniciação Científica PIBIC/CNPq',
    instituicaoResponsavel: 'UFAPE / CNPq',
    dataRealizacao: '2026-05-20',
    cargaHorariaEmHoras: 45,
    natureza: 'ACC',
    categoria: 'PESQUISA',
    dataCadastro: '2026-05-21T09:15:00',
    status: 'APROVADA',
  },
  {
    id: 4,
    titulo: 'Seminário Regional de Engenharia de Software',
    instituicaoResponsavel: 'SBC Pernambuco',
    dataRealizacao: '2026-06-05',
    cargaHorariaEmHoras: 15,
    natureza: 'ACC',
    categoria: 'EVENTOS',
    dataCadastro: '2026-06-06T14:00:00',
    status: 'PENDENTE',
  },
];

// 2. Solicitações de Validação
export const SOLICITACOES_MOCK: SolicitacaoAvaliadorDetalhe[] = [
  {
    id: 7,
    estudanteNome: 'Lucas Gabriel Silva',
    estudanteEmail: 'aluno1@ufape.edu.br',
    dataSubmissao: '2026-08-20T10:30:00',
    status: 'SUBMETIDA',
    cargaHorariaTotal: 90,
    itens: [
      {
        atividadeId: 1,
        titulo: 'Monitoria Acadêmica de Algoritmos',
        cargaHoraria: 30,
        natureza: 'ACC',
      },
      {
        atividadeId: 2,
        titulo: 'Projeto de Extensão AgroTI Comunitária',
        cargaHoraria: 60,
        natureza: 'ACEX',
      },
    ],
  },
  {
    id: 8,
    estudanteNome: 'Beatriz Lima Santos',
    estudanteEmail: 'aluno2@ufape.edu.br',
    dataSubmissao: '2026-08-22T14:00:00',
    status: 'COM_PENDENCIAS',
    justificativa: 'Comprovante ilegível ou sem assinatura do orientador.',
    dataAvaliacao: '2026-08-24T11:20:00',
    cargaHorariaTotal: 45,
    itens: [
      {
        atividadeId: 3,
        titulo: 'Iniciação Científica PIBIC/CNPq',
        cargaHoraria: 45,
        natureza: 'ACC',
      },
    ],
  },
  {
    id: 9,
    estudanteNome: 'Carlos Eduardo Souza',
    estudanteEmail: 'carlos.souza@ufape.edu.br',
    dataSubmissao: '2026-08-25T09:00:00',
    status: 'APROVADA',
    dataAvaliacao: '2026-08-26T16:45:00',
    cargaHorariaTotal: 30,
    itens: [
      {
        atividadeId: 1,
        titulo: 'Monitoria Acadêmica de Algoritmos',
        cargaHoraria: 30,
        natureza: 'ACC',
      },
    ],
  },
];

export const SOLICITACOES_AVALIADOR_MOCK = SOLICITACOES_MOCK;

// 3. Regulamentos
export const REGULAMENTOS_MOCK: RegulamentoChunk[] = [
  {
    id: 1,
    artigo: 'Art. 12',
    conteudoTexto:
      'Atividades de Ensino e Monitoria Acadêmica: Válidas como ACC com limite de aproveitamento máximo de 40 horas por semestre letivo.',
  },
  {
    id: 2,
    artigo: 'Art. 13',
    conteudoTexto:
      'Atividades de Pesquisa e Iniciação Científica (PIBIC/PIBITI): Válidas como ACC com limite máximo de 60 horas comprovadas por projeto.',
  },
  {
    id: 3,
    artigo: 'Art. 14',
    conteudoTexto:
      'Ações Contínuas de Extensão Universitária e Projetos Comunitários: Exclusivas para cumprimento da carga horária de ACEX (exigência total de 320h).',
  },
  {
    id: 4,
    artigo: 'Art. 15',
    conteudoTexto:
      'Participação em Eventos Científicos, Congressos e Seminários: Válidos como ACC na categoria EVENTOS, com limite acumulado de 30 horas.',
  },
];

// 4. Mocks de Cursos e Usuários
export interface CursoMock {
  id: number;
  nome: string;
  codigo: string;
  cargaHorariaAcc: number;
  cargaHorariaAcex: number;
}

export const CURSOS_MOCK: CursoMock[] = [
  {
    id: 1,
    nome: 'Engenharia de Software',
    codigo: 'ES',
    cargaHorariaAcc: 90,
    cargaHorariaAcex: 320,
  },
  {
    id: 2,
    nome: 'Ciência da Computação',
    codigo: 'CC',
    cargaHorariaAcc: 90,
    cargaHorariaAcex: 320,
  },
  { id: 3, nome: 'Agronomia', codigo: 'AGRO', cargaHorariaAcc: 120, cargaHorariaAcex: 300 },
];

export interface UsuarioMock {
  id: number;
  nome: string;
  email: string;
  role: 'ESTUDANTE' | 'AVALIADOR' | 'ADMINISTRADOR';
  status: string;
}

export const USUARIOS_MOCK: UsuarioMock[] = [
  {
    id: 1,
    nome: 'Lucas Gabriel Silva',
    email: 'aluno1@ufape.edu.br',
    role: 'ESTUDANTE',
    status: 'ATIVO',
  },
  {
    id: 2,
    nome: 'Prof. Dr. Ricardo Santos',
    email: 'avaliador@ufape.edu.br',
    role: 'AVALIADOR',
    status: 'ATIVO',
  },
  {
    id: 3,
    nome: 'Admin SGAC',
    email: 'admin@ufape.edu.br',
    role: 'ADMINISTRADOR',
    status: 'ATIVO',
  },
];

// 5. Funções de Cálculo Dinâmico
export function obterProgressoCalculado(): ProgressoCargaHorariaDTO {
  const accAprovadas = ATIVIDADES_MOCK.filter(
    (a) => a.natureza === 'ACC' && a.status === 'APROVADA',
  ).reduce((s, a) => s + a.cargaHorariaEmHoras, 0);

  const accPendentes = ATIVIDADES_MOCK.filter(
    (a) => a.natureza === 'ACC' && a.status !== 'APROVADA',
  ).reduce((s, a) => s + a.cargaHorariaEmHoras, 0);

  const acexAprovadas = ATIVIDADES_MOCK.filter(
    (a) => a.natureza === 'ACEX' && a.status === 'APROVADA',
  ).reduce((s, a) => s + a.cargaHorariaEmHoras, 0);

  const acexPendentes = ATIVIDADES_MOCK.filter(
    (a) => a.natureza === 'ACEX' && a.status !== 'APROVADA',
  ).reduce((s, a) => s + a.cargaHorariaEmHoras, 0);

  return {
    acc: {
      horasAcumuladas: accAprovadas,
      horasPendentes: accPendentes,
      horasExigidas: 90,
      percentualConcluido: Math.min(100, Math.round((accAprovadas * 100) / 90)),
    },
    acex: {
      horasAcumuladas: acexAprovadas,
      horasPendentes: acexPendentes,
      horasExigidas: 320,
      percentualConcluido: Math.min(100, Math.round((acexAprovadas * 100) / 320)),
    },
  };
}

export function obterRelatorioCalculado(email: string): RelatorioAtividades {
  const accAtividades = ATIVIDADES_MOCK.filter((a) => a.natureza === 'ACC');
  const acexAtividades = ATIVIDADES_MOCK.filter((a) => a.natureza === 'ACEX');

  const agruparCategorias = (lista: Atividade[]) => {
    const categoriasMap = new Map<string, Atividade[]>();
    for (const a of lista) {
      const arr = categoriasMap.get(a.categoria) ?? [];
      arr.push(a);
      categoriasMap.set(a.categoria, arr);
    }
    return Array.from(categoriasMap.entries()).map(([categoria, items]) => ({
      categoria,
      totalHoras: items.reduce((acc, cur) => acc + cur.cargaHorariaEmHoras, 0),
      atividades: items.map((i) => ({
        id: i.id,
        titulo: i.titulo,
        instituicaoResponsavel: i.instituicaoResponsavel,
        dataRealizacao: i.dataRealizacao,
        cargaHorariaEmHoras: i.cargaHorariaEmHoras,
      })),
    }));
  };

  const totalHorasAcc = accAtividades.reduce((s, a) => s + a.cargaHorariaEmHoras, 0);
  const totalHorasAcex = acexAtividades.reduce((s, a) => s + a.cargaHorariaEmHoras, 0);

  const naturezas = [];
  if (accAtividades.length > 0) {
    naturezas.push({
      natureza: 'ACC',
      totalHoras: totalHorasAcc,
      categorias: agruparCategorias(accAtividades),
    });
  }
  if (acexAtividades.length > 0) {
    naturezas.push({
      natureza: 'ACEX',
      totalHoras: totalHorasAcex,
      categorias: agruparCategorias(acexAtividades),
    });
  }

  return {
    estudanteEmail: email || 'aluno1@ufape.edu.br',
    naturezas,
    totalHorasAcc,
    totalHorasAcex,
    totalHorasGeral: totalHorasAcc + totalHorasAcex,
  };
}

export const REVISAO_CONFIRMACAO_MOCK = {
  solicitacaoId: 8,
  itensCorrigidos: [
    {
      atividadeId: 3,
      titulo: 'Iniciação Científica PIBIC/CNPq',
      cargaHoraria: 45,
      natureza: 'ACC',
    },
  ],
  novosComprovantes: ['certificado_corrigido.pdf'],
  observacoesAvaliador: 'Reenviar com assinatura digitalizada do orientador.',
  statusAnterior: 'COM_PENDENCIAS',
  statusNovo: 'SUBMETIDA',
};

export const ATIVIDADES_MOCK_INICIAIS: Atividade[] = ATIVIDADES_MOCK.map((a) => ({ ...a }));

export function resetarAtividadesMock(): void {
  ATIVIDADES_MOCK.length = 0;
  ATIVIDADES_MOCK.push(...ATIVIDADES_MOCK_INICIAIS.map((a) => ({ ...a })));
}
