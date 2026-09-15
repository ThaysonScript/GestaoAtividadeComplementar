package br.edu.ufape.backend.revisao.service;

import org.springframework.stereotype.Service;

import br.edu.ufape.backend.revisao.dto.DadosRevisaoReenvioDTO;

@Service
public class RevisaoConfirmacaoService {

    public DadosRevisaoReenvioDTO listar(Long solicitacaoId) {
        return new DadosRevisaoReenvioDTO(solicitacaoId, "SUBMETIDA", true, false, "COM_PENDENCIAS");
    }

    public DadosRevisaoReenvioDTO confirmar(Long solicitacaoId) {
        return new DadosRevisaoReenvioDTO(solicitacaoId, "SUBMETIDA", true, true, "COM_PENDENCIAS");
    }
}
