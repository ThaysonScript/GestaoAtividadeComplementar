package br.edu.ufape.backend.correcao.dto;

public record SubstituicaoComprovanteDTO(Long atividadeId, String titulo, String status, String natureza,
		Integer cargaHoraria, String descricao, Boolean comprovanteRemovido, String novoComprovante,
		Boolean validacaoTamanho, Boolean validacaoTipo, Boolean bloqueado) {
}
