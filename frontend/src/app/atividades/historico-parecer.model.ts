import { StatusSolicitacao } from '../solicitacao/solicitacao.model';

export type TipoParecerAvaliador = 'CORRECAO' | 'MANTIDO' | 'PRE_APROVADO';

export interface ParecerAvaliadorHistorico {
  id: number;
  atividadeId: number;
  dataAvaliacao: string;
  statusSolicitacao: StatusSolicitacao;
  tipoParecer: TipoParecerAvaliador;
  justificativa?: string;
  observacoes?: string;
  artigoRegulamento?: string;
  cargaHorariaAproveitavel?: number;
}

export interface AtividadeComHistoricoParecer {
  atividadeId: number;
  titulo: string;
  natureza: string;
  categoria: string;
  cargaHorariaEmHoras: number;
  statusAtual?: string;
  pareceres: ParecerAvaliadorHistorico[];
  pendenciasAtivas: boolean;
}
