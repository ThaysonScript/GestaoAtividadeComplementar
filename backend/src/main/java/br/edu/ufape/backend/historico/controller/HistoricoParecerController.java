package br.edu.ufape.backend.historico.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/historico-pareceres")
public class HistoricoParecerController {

    @GetMapping
    public ResponseEntity<List<Object>> listar() {
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/atividade/{id}")
    public ResponseEntity<List<Object>> buscarPorAtividade(@PathVariable Long id) {
        return ResponseEntity.ok(List.of());
    }
}
