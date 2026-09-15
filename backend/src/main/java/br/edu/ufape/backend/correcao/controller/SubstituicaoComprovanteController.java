package br.edu.ufape.backend.correcao.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.edu.ufape.backend.correcao.dto.SubstituicaoComprovanteDTO;
import br.edu.ufape.backend.correcao.facade.SubstituicaoFacade;

@RestController
@RequestMapping("/api/v1/substituicao-comprovante")
public class SubstituicaoComprovanteController {

	private final SubstituicaoFacade facade;

	public SubstituicaoComprovanteController(SubstituicaoFacade facade) {
		this.facade = facade;
	}

	@PostMapping
	public ResponseEntity<SubstituicaoComprovanteDTO> substituir(Long id, MultipartFile arquivo) {
		return ResponseEntity.ok(facade.substituir(id, arquivo));
	}

	@PatchMapping("/{id}")
	public ResponseEntity<SubstituicaoComprovanteDTO> atualizarMetadados(@PathVariable Long id,
			@RequestBody SubstituicaoComprovanteDTO dados) {
		return ResponseEntity.ok(facade.atualizarMetadados(dados));
	}
}
