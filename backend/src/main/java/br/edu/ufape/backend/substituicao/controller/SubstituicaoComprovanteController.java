package br.edu.ufape.backend.substituicao.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/substituicao-comprovante")
public class SubstituicaoComprovanteController {

    @PostMapping
    public ResponseEntity<Object> substituir() {
        return ResponseEntity.ok().build();
    }
}
