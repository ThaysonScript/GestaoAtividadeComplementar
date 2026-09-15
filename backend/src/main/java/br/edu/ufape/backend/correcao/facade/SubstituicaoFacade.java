package br.edu.ufape.backend.correcao.facade;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import br.edu.ufape.backend.correcao.dto.SubstituicaoComprovanteDTO;
import br.edu.ufape.backend.correcao.service.SubstituicaoService;

@Component
public class SubstituicaoFacade {

	private final SubstituicaoService service;

	public SubstituicaoFacade(SubstituicaoService service) {
		this.service = service;
	}

	public SubstituicaoComprovanteDTO substituir(Long id, MultipartFile arquivo) {
		return service.substituir(id, arquivo);
	}

	public SubstituicaoComprovanteDTO atualizarMetadados(SubstituicaoComprovanteDTO dados) {
		return service.atualizarMetadados(dados);
	}
}
