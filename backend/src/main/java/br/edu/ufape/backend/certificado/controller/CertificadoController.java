package br.edu.ufape.backend.certificado.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import br.edu.ufape.backend.certificado.facade.CertificadoFacade;

@RestController
@RequestMapping("/api/v1/atividades")
public class CertificadoController {

	private static final Logger log = LoggerFactory.getLogger(CertificadoController.class);
	private final CertificadoFacade certificadoFacade;

	public CertificadoController(CertificadoFacade certificadoFacade) {
		this.certificadoFacade = certificadoFacade;
	}

	@GetMapping("/{id}/certificado")
	public ResponseEntity<Resource> obterCertificado(@PathVariable Long id, Authentication authentication) {
		if (authentication == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		Resource resource;
		if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_AVALIADOR")
				|| a.getAuthority().equals("ROLE_ADMINISTRADOR"))) {
			resource = certificadoFacade.obterCertificadoSemRestricao(id);
		} else {
			String emailEstudante = authentication.getName();
			resource = certificadoFacade.obterCertificado(id, emailEstudante);
		}
		String contentType = "application/pdf";
		try {
			Path path = resource.getFile().toPath();
			String probedType = Files.probeContentType(path);
			if (probedType != null) {
				contentType = probedType;
			}
		} catch (IOException ex) {
			log.debug("Falha ao determinar Content-Type do arquivo do certificado: {}", ex.getMessage());
		}
		return ResponseEntity.ok().contentType(MediaType.parseMediaType(contentType))
				.header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
				.body(resource);
	}
}
