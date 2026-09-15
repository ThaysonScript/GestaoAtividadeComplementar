package br.edu.ufape.backend.correcao.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.edu.ufape.backend.correcao.dto.ConfirmacaoReenvioRequestDTO;
import br.edu.ufape.backend.correcao.dto.DadosRevisaoReenvioDTO;
import br.edu.ufape.backend.correcao.facade.RevisaoConfirmacaoFacade;

@RestController
@RequestMapping("/api/v1/revisao-confirmacao")
public class RevisaoConfirmacaoController {

	private final RevisaoConfirmacaoFacade facade;

	public RevisaoConfirmacaoController(RevisaoConfirmacaoFacade facade) {
		this.facade = facade;
	}

	@GetMapping
	public ResponseEntity<DadosRevisaoReenvioDTO> listar(@RequestParam(required = false) Long solicitacaoId) {
		return ResponseEntity.ok(facade.listar(solicitacaoId != null ? solicitacaoId : 1L));
	}

	@PatchMapping
	public ResponseEntity<DadosRevisaoReenvioDTO> confirmar(@RequestBody ConfirmacaoReenvioRequestDTO request) {
		return ResponseEntity.ok(facade.confirmar(request.solicitacaoId()));
	}
}
