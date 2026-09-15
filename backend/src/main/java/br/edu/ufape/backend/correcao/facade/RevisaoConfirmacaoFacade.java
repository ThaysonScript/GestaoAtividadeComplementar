package br.edu.ufape.backend.correcao.facade;

import org.springframework.stereotype.Component;

import br.edu.ufape.backend.correcao.dto.DadosRevisaoReenvioDTO;
import br.edu.ufape.backend.correcao.service.RevisaoConfirmacaoService;

@Component
public class RevisaoConfirmacaoFacade {

	private final RevisaoConfirmacaoService service;

	public RevisaoConfirmacaoFacade(RevisaoConfirmacaoService service) {
		this.service = service;
	}

	public DadosRevisaoReenvioDTO listar(Long solicitacaoId) {
		return service.listar(solicitacaoId);
	}

	public DadosRevisaoReenvioDTO confirmar(Long solicitacaoId) {
		return service.confirmar(solicitacaoId);
	}
}
