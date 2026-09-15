package br.edu.ufape.backend.historico.service;

import java.util.List;

import org.springframework.stereotype.Service;

import br.edu.ufape.backend.historico.dto.AtividadeComHistoricoParecerDTO;
import br.edu.ufape.backend.historico.dto.ParecerAvaliadorHistoricoDTO;

@Service
public class HistoricoParecerService {

    public List<AtividadeComHistoricoParecerDTO> listarPorEstudante() {
        return List.of();
    }

    public List<ParecerAvaliadorHistoricoDTO> buscarPorAtividade(Long id) {
        return List.of();
    }
}
