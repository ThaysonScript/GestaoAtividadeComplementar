package br.edu.ufape.backend.solicitacao.model;

public record ParecerPorAtividade(Long atividadeId, String status, String justificativa, String tipoParecer,
		String observacoes, String artigoRegulamento, Integer cargaHorariaAproveitavel, String dataAvaliacao) {
}
