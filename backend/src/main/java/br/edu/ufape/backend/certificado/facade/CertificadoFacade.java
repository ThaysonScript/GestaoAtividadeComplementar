package br.edu.ufape.backend.certificado.facade;

import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import br.edu.ufape.backend.atividade.service.AtividadeComplementarService;

@Component
public class CertificadoFacade {

	private final AtividadeComplementarService atividadeComplementarService;

	public CertificadoFacade(AtividadeComplementarService atividadeComplementarService) {
		this.atividadeComplementarService = atividadeComplementarService;
	}

	public Resource obterCertificado(Long atividadeId, String emailEstudante) {
		return atividadeComplementarService.obterArquivoCertificado(atividadeId, emailEstudante);
	}

	public Resource obterCertificadoSemRestricao(Long atividadeId) {
		return atividadeComplementarService.obterArquivoCertificadoSemRestricao(atividadeId);
	}
}
