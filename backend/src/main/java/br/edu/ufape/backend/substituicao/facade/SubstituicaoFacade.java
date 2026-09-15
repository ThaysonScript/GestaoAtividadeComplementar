package br.edu.ufape.backend.substituicao.facade;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import br.edu.ufape.backend.substituicao.dto.SubstituicaoComprovanteDTO;
import br.edu.ufape.backend.substituicao.service.SubstituicaoService;

@Component
public class SubstituicaoFacade {

    private final SubstituicaoService service;

    public SubstituicaoFacade(SubstituicaoService service) {
        this.service = service;
    }

    public SubstituicaoComprovanteDTO substituir(Long id, MultipartFile arquivo) {
        return service.substituir(id, arquivo);
    }

    public SubstituicaoComprovanteDTO atualizarMetadados(Long id, SubstituicaoComprovanteDTO dados) {
        return service.atualizarMetadados(id, dados);
    }
}
