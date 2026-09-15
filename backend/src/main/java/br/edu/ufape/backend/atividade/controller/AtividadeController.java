package br.edu.ufape.backend.atividade.controller;

import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import br.edu.ufape.backend.atividade.dto.AtividadeResponseDTO;
import br.edu.ufape.backend.atividade.dto.AtualizarAtividadeRequestDTO;
import br.edu.ufape.backend.atividade.dto.CadastroAtividadeRequestDTO;
import br.edu.ufape.backend.atividade.facade.AtividadeFacade;
import br.edu.ufape.backend.atividade.model.Categoria;
import br.edu.ufape.backend.atividade.model.Natureza;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/atividades")
public class AtividadeController {

	private final AtividadeFacade atividadeFacade;

	public AtividadeController(AtividadeFacade atividadeFacade) {
		this.atividadeFacade = atividadeFacade;
	}

	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<AtividadeResponseDTO> cadastrar(@Valid @ModelAttribute CadastroAtividadeRequestDTO request,
			@RequestPart("arquivo") MultipartFile arquivo, Authentication authentication) {
		if (authentication == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		String emailEstudante = authentication.getName();
		AtividadeResponseDTO response = atividadeFacade.cadastrarAtividade(request, arquivo, emailEstudante);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@GetMapping
	public ResponseEntity<List<AtividadeResponseDTO>> listar(@RequestParam(required = false) Natureza natureza,
			@RequestParam(required = false) Categoria categoria, Authentication authentication) {
		if (authentication == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		String emailEstudante = authentication.getName();
		List<AtividadeResponseDTO> atividades = atividadeFacade.listarAtividadesDoEstudante(emailEstudante, natureza,
				categoria);
		return ResponseEntity.ok(atividades);
	}

	@PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<AtividadeResponseDTO> atualizar(@PathVariable Long id,
			@Valid @ModelAttribute AtualizarAtividadeRequestDTO request,
			@RequestParam(value = "arquivo", required = false) MultipartFile arquivo, Authentication authentication) {
		if (authentication == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		String emailEstudante = authentication.getName();
		AtividadeResponseDTO response = atividadeFacade.atualizarAtividade(id, request, arquivo, emailEstudante);
		return ResponseEntity.ok(response);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> excluir(@PathVariable Long id, Authentication authentication) {
		if (authentication == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		String emailEstudante = authentication.getName();
		atividadeFacade.excluirAtividade(id, emailEstudante);
		return ResponseEntity.noContent().build();
	}

	@ExceptionHandler(BindException.class)
	public ResponseEntity<Map<String, String>> tratarFalhaDeValidacao(BindException ex) {
		String mensagem = ex.getBindingResult().getFieldErrors().stream().findFirst()
				.map(erro -> erro.getField() + ": " + erro.getDefaultMessage()).orElse("Dados de cadastro inválidos");
		return ResponseEntity.badRequest().body(Map.of("message", mensagem));
	}

	@GetMapping("/{id:[0-9]+}")
	public ResponseEntity<AtividadeResponseDTO> buscarPorId(@PathVariable Long id, Authentication authentication) {
		if (authentication == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		AtividadeResponseDTO response = atividadeFacade.buscarPorId(id);
		return ResponseEntity.ok(response);
	}

	@PostMapping("/{id}/avaliar")
	public ResponseEntity<br.edu.ufape.backend.ia.dto.ParecerResponseDTO> avaliar(@PathVariable Long id,
			@Valid @RequestBody br.edu.ufape.backend.atividade.dto.AvaliacaoDecisaoRequestDTO request) {
		br.edu.ufape.backend.ia.dto.ParecerResponseDTO response = atividadeFacade.avaliarAtividade(id, request);
		return ResponseEntity.ok(response);
	}
}
