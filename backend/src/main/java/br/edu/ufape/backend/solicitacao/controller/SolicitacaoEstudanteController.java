package br.edu.ufape.backend.solicitacao.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.edu.ufape.backend.solicitacao.dto.SolicitacaoDetalheResponseDTO;
import br.edu.ufape.backend.solicitacao.dto.SolicitacaoResumoResponseDTO;
import br.edu.ufape.backend.solicitacao.dto.SolicitacaoResponseDTO;
import br.edu.ufape.backend.solicitacao.facade.SolicitacaoFacade;

@RestController
@RequestMapping("/api/v1/solicitacoes")
public class SolicitacaoEstudanteController {

	private final SolicitacaoFacade solicitacaoFacade;

	public SolicitacaoEstudanteController(SolicitacaoFacade solicitacaoFacade) {
		this.solicitacaoFacade = solicitacaoFacade;
	}

	@PostMapping
	public ResponseEntity<SolicitacaoResponseDTO> submeter(Authentication authentication) {
		if (authentication == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		String emailEstudante = authentication.getName();
		SolicitacaoResponseDTO response = solicitacaoFacade.submeter(emailEstudante);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@GetMapping
	public ResponseEntity<List<SolicitacaoResumoResponseDTO>> listar(Authentication authentication) {
		if (authentication == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		String emailEstudante = authentication.getName();
		List<SolicitacaoResumoResponseDTO> response = solicitacaoFacade.listarDoEstudante(emailEstudante);
		return ResponseEntity.ok(response);
	}

	@PostMapping("/{solicitacaoId}/atividades")
	public ResponseEntity<SolicitacaoResponseDTO> anexarAtividade(@PathVariable Long solicitacaoId,
			@RequestBody(required = false) Long atividadeId, Authentication authentication) {
		if (authentication == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		String emailEstudante = authentication.getName();
		SolicitacaoResponseDTO response = solicitacaoFacade.anexarAtividade(emailEstudante, solicitacaoId, atividadeId);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@GetMapping("/atividade/{atividadeId}/em-aberto")
	public ResponseEntity<Boolean> verificarEmAbertoComAtividade(@PathVariable Long atividadeId,
			Authentication authentication) {
		if (authentication == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		boolean emAberto = solicitacaoFacade.existeSolicitacaoEmAbertoComAtividade(atividadeId);
		return ResponseEntity.ok(emAberto);
	}

	@GetMapping("/{id}")
	public ResponseEntity<SolicitacaoDetalheResponseDTO> detalhar(@PathVariable Long id,
			Authentication authentication) {
		if (authentication == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		String emailEstudante = authentication.getName();
		SolicitacaoDetalheResponseDTO response = solicitacaoFacade.detalhar(emailEstudante, id);
		return ResponseEntity.ok(response);
	}
}
