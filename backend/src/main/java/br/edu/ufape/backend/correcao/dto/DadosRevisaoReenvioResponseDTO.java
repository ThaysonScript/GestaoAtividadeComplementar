package br.edu.ufape.backend.correcao.dto;

import java.util.List;

import br.edu.ufape.backend.solicitacao.dto.SolicitacaoAtividadeResponseDTO;

public record DadosRevisaoReenvioResponseDTO(Long solicitacaoId, List<SolicitacaoAtividadeResponseDTO> itensCorrigidos,
		List<String> novosComprovantes, String observacoesAvaliador, String statusAnterior, String statusNovo) {
}
