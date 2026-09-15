import { SolicitacaoItem } from './solicitacao.model';

export interface DadosRevisaoReenvio {
  solicitacaoId: number;
  itensCorrigidos: SolicitacaoItem[];
  novosComprovantes: string[];
  observacoesAvaliador?: string;
  statusAnterior: string;
  statusNovo: string;
}

export interface EstadoRevisaoConfirmacao {
  revisaoAtiva: boolean;
  dadosCorrigidos?: DadosRevisaoReenvio;
  edicaoBloqueada: boolean;
  modoLeitura: boolean;
}
