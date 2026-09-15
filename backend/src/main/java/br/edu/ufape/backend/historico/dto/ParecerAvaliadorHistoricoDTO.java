package br.edu.ufape.backend.historico.dto;

public record ParecerAvaliadorHistoricoDTO(Long id, Long atividadeId, String dataAvaliacao, String statusSolicitacao,
		String tipoParecer, String justificativa, String observacoes, String artigoRegulamento,
		Integer cargaHorariaAproveitavel) {
}
