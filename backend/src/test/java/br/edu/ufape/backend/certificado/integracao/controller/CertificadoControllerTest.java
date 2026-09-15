package br.edu.ufape.backend.certificado.integracao.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import br.edu.ufape.backend.certificado.controller.CertificadoController;
import br.edu.ufape.backend.certificado.facade.CertificadoFacade;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class CertificadoControllerTest {

	private MockMvc mockMvc;

	@Mock
	private CertificadoFacade certificadoFacade;

	@InjectMocks
	private CertificadoController controller;

	@BeforeEach
	void setUp() {
		mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
	}

	@Test
	@DisplayName("Deve retornar o arquivo do certificado com status 200 OK")
	void deveRetornarCertificadoComSucesso() throws Exception {
		Resource resource = new NamedByteArrayResource("PDF-CONTENT".getBytes(), "certificado.pdf");
		when(certificadoFacade.obterCertificado(1L, "estudante@ufape.edu.br")).thenReturn(resource);

		mockMvc.perform(get("/api/v1/atividades/1/certificado")
				.principal(new UsernamePasswordAuthenticationToken("estudante@ufape.edu.br", "password")))
				.andExpect(status().isOk())
				.andExpect(header().string("Content-Disposition", "inline; filename=\"certificado.pdf\""));
	}

	@Test
	@DisplayName("Deve retornar certificado para avaliador sem restricao")
	void deveRetornarCertificadoParaAvaliador() throws Exception {
		Resource resource = new NamedByteArrayResource("PDF-ADMIN".getBytes(), "certificado.pdf");
		when(certificadoFacade.obterCertificadoSemRestricao(1L)).thenReturn(resource);

		mockMvc.perform(get("/api/v1/atividades/1/certificado").principal(new UsernamePasswordAuthenticationToken(
				"admin@ufape.edu.br", "password",
				java.util.Collections.singleton(
						new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMINISTRADOR")))))
				.andExpect(status().isOk());
	}

	@Test
	@DisplayName("Deve retornar 401 Unauthorized quando não autenticado")
	void deveRetornarUnauthorizedQuandoNaoAutenticado() throws Exception {
		mockMvc.perform(get("/api/v1/atividades/1/certificado")).andExpect(status().isUnauthorized());
	}

	private static class NamedByteArrayResource extends ByteArrayResource {
		private final String filename;

		public NamedByteArrayResource(byte[] byteArray, String filename) {
			super(byteArray);
			this.filename = filename;
		}

		@Override
		public String getFilename() {
			return this.filename;
		}
	}
}
