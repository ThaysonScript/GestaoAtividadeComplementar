package br.edu.ufape.backend.revisao.dto;

public record ConfirmacaoReenvioRequestDTO(
    Boolean confirmado,
    Long solicitacaoId
) {}
