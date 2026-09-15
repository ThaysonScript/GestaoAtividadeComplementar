export type StatusSolicitacao =
  | 'SUBMETIDA'
  | 'EM_ANALISE'
  | 'COM_PENDENCIAS'
  | 'APROVADA'
  | 'REJEITADA';

export interface SolicitacaoItem {
  atividadeId: number;
  titulo: string;
  cargaHoraria: number;
  natureza: string;
  status?: StatusSolicitacao;
  justificativa?: string;
}

export interface SolicitacaoResumo {
  id: number;
  status: StatusSolicitacao;
  dataSubmissao: string;
  dataAvaliacao?: string;
  totalAtividades: number;
}

export interface SolicitacaoDetalhe extends SolicitacaoResumo {
  justificativa?: string;
  itens: SolicitacaoItem[];
}
