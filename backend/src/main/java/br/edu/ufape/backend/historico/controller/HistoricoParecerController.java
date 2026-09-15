package br.edu.ufape.backend.historico.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.edu.ufape.backend.historico.dto.AtividadeComHistoricoParecerDTO;
import br.edu.ufape.backend.historico.dto.ParecerAvaliadorHistoricoDTO;
import br.edu.ufape.backend.historico.facade.HistoricoParecerFacade;

@RestController
@RequestMapping("/api/v1/historico-pareceres")
public class HistoricoParecerController {

    private final HistoricoParecerFacade facade;

    public HistoricoParecerController(HistoricoParecerFacade facade) {
        this.facade = facade;
    }

    @GetMapping
    public ResponseEntity<List<AtividadeComHistoricoParecerDTO>> listar() {
        return ResponseEntity.ok(facade.listarPorEstudante());
    }

    @GetMapping("/atividade/{id}")
    public ResponseEntity<List<ParecerAvaliadorHistoricoDTO>> buscarPorAtividade(@PathVariable Long id) {
        return ResponseEntity.ok(facade.buscarPorAtividade(id));
    }
}
