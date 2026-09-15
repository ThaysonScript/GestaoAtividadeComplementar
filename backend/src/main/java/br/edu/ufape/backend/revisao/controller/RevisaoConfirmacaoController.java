package br.edu.ufape.backend.revisao.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/revisao-confirmacao")
public class RevisaoConfirmacaoController {

    @GetMapping
    public ResponseEntity<Object> listar() {
        return ResponseEntity.ok().build();
    }

    @PatchMapping
    public ResponseEntity<Object> confirmar() {
        return ResponseEntity.ok().build();
    }
}
