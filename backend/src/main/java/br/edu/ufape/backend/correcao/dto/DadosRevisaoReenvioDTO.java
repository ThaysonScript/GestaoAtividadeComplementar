package br.edu.ufape.backend.correcao.dto;

import java.util.List;

public record DadosRevisaoReenvioDTO(Long solicitacaoId, List<ItemCorrigidoDTO> itensCorrigidos,
		List<String> novosComprovantes, String observacoesAvaliador, String statusAnterior, String statusNovo,
		Boolean bloqueado, Boolean confirmado) {
	public record ItemCorrigidoDTO(Long atividadeId, String titulo, String natureza, Integer cargaHoraria,
			String status) {
	}
}
