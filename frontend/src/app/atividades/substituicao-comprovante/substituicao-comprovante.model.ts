export interface DadosSubstituicaoComprovante {
  atividadeId: number;
  titulo: string;
  comprovanteRemovido: boolean;
  novoComprovante: File | null;
  validacaoTamanho: boolean;
  validacaoTipo: boolean;
  bloqueado: boolean;
}
