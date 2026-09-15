package br.edu.ufape.backend.solicitacao.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.edu.ufape.backend.solicitacao.dto.AvaliacaoSolicitacaoRequestDTO;
import br.edu.ufape.backend.solicitacao.dto.SolicitacaoAvaliadorDetalheResponseDTO;
import br.edu.ufape.backend.solicitacao.dto.SolicitacaoAvaliadorResumoResponseDTO;
import br.edu.ufape.backend.solicitacao.dto.SolicitacaoDetalheResponseDTO;
import br.edu.ufape.backend.solicitacao.facade.SolicitacaoFacade;
import br.edu.ufape.backend.solicitacao.model.StatusSolicitacao;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/solicitacoes")
public class SolicitacaoAvaliacaoController {

	private final SolicitacaoFacade facade;

	public SolicitacaoAvaliacaoController(SolicitacaoFacade facade) {
		this.facade = facade;
	}

	@PatchMapping("/{id}/avaliacao")
	public ResponseEntity<SolicitacaoDetalheResponseDTO> avaliar(@PathVariable Long id,
			@RequestBody @Valid AvaliacaoSolicitacaoRequestDTO request, Authentication authentication) {
		if (authentication == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		SolicitacaoDetalheResponseDTO response = facade.avaliar(id, authentication.getName(), request.decisao(),
				request.justificativa());
		return ResponseEntity.ok(response);
	}

	@GetMapping("/avaliacao")
	public ResponseEntity<List<SolicitacaoAvaliadorResumoResponseDTO>> listarParaAvaliacao(
			@RequestParam(required = false) StatusSolicitacao status) {
		List<SolicitacaoAvaliadorResumoResponseDTO> response = facade.listarParaAvaliacao(status);
		return ResponseEntity.ok(response);
	}

	@PatchMapping("/{solicitacaoId}/atividades/{atividadeId}/avaliacao")
	public ResponseEntity<SolicitacaoAvaliadorDetalheResponseDTO> avaliarAtividade(
			@PathVariable Long solicitacaoId, @PathVariable Long atividadeId,
			@RequestBody @Valid AvaliacaoSolicitacaoRequestDTO request, Authentication authentication) {
		if (authentication == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		facade.avaliarPorAtividade(solicitacaoId, atividadeId, request.decisao().name(), request.justificativa());
		return ResponseEntity.ok(facade.detalharParaAvaliacao(solicitacaoId));
	}

	@GetMapping("/{id}/avaliacao")
	public ResponseEntity<SolicitacaoAvaliadorDetalheResponseDTO> detalharParaAvaliacao(@PathVariable Long id) {
		SolicitacaoAvaliadorDetalheResponseDTO response = facade.detalharParaAvaliacao(id);
		return ResponseEntity.ok(response);
	}
}
