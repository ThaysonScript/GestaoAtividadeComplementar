package br.edu.ufape.backend.solicitacao.dto;

import br.edu.ufape.backend.solicitacao.model.SolicitacaoAtividade;

public record SolicitacaoAtividadeResponseDTO(Long atividadeId, String titulo, Integer cargaHoraria, String natureza,
		String status, String justificativa) {
	public SolicitacaoAtividadeResponseDTO(SolicitacaoAtividade item) {
		this(item.getAtividadeId(), item.getTitulo(), item.getCargaHoraria(), item.getNatureza(), item.getStatus(),
				item.getJustificativa());
	}
}
