package br.edu.ufape.backend.revisao.dto;

public record DadosRevisaoReenvioDTO(
    Long solicitacaoId,
    String statusNovo,
    Boolean bloqueado,
    Boolean confirmado,
    String statusAnterior
) {}
