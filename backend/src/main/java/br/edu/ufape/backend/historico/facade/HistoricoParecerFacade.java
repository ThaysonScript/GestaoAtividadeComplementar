package br.edu.ufape.backend.historico.facade;

import java.util.List;

import org.springframework.stereotype.Component;

import br.edu.ufape.backend.historico.dto.AtividadeComHistoricoParecerDTO;
import br.edu.ufape.backend.historico.dto.ParecerAvaliadorHistoricoDTO;
import br.edu.ufape.backend.historico.service.HistoricoParecerService;

@Component
public class HistoricoParecerFacade {

    private final HistoricoParecerService service;

    public HistoricoParecerFacade(HistoricoParecerService service) {
        this.service = service;
    }

    public List<AtividadeComHistoricoParecerDTO> listarPorEstudante() {
        return service.listarPorEstudante();
    }

    public List<ParecerAvaliadorHistoricoDTO> buscarPorAtividade(Long id) {
        return service.buscarPorAtividade(id);
    }
}
