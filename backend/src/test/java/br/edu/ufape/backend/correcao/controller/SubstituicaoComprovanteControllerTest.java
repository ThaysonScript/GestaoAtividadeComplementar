package br.edu.ufape.backend.correcao.controller;

import br.edu.ufape.backend.atividade.repository.AtividadeComplementarRepository;
import br.edu.ufape.backend.correcao.dto.SubstituicaoComprovanteDTO;
import br.edu.ufape.backend.correcao.facade.SubstituicaoFacade;
import br.edu.ufape.backend.correcao.service.SubstituicaoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SubstituicaoComprovanteControllerTest {

	private MockMvc mockMvc;
	private SubstituicaoFacade facade;
	private final ObjectMapper objectMapper = new ObjectMapper();

	@BeforeEach
	void setUp() {
		facade = mock(SubstituicaoFacade.class);
		SubstituicaoComprovanteController controller = new SubstituicaoComprovanteController(facade);
		mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
	}

	@Test
	void deveSubstituirEAtualizarMetadadosViaController() throws Exception {
		SubstituicaoComprovanteDTO dto = new SubstituicaoComprovanteDTO(1L, "Titulo", "PENDENTE", "ACC", 30, "Desc",
				false, "arq.pdf", true, true, false);
		when(facade.substituir(eq(1L), any())).thenReturn(dto);
		when(facade.atualizarMetadados(any())).thenReturn(dto);

		MockMultipartFile file = new MockMultipartFile("arquivo", "cert.pdf", "application/pdf", new byte[10]);

		mockMvc.perform(multipart("/api/v1/substituicao-comprovante").param("id", "1").file(file))
				.andExpect(status().isOk());

		mockMvc.perform(patch("/api/v1/substituicao-comprovante/1").contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(dto))).andExpect(status().isOk());
	}

	@Test
	void deveExecutarInstanciaRealDoFacade() {
		AtividadeComplementarRepository repo = mock(AtividadeComplementarRepository.class);
		SubstituicaoService service = new SubstituicaoService(repo);
		SubstituicaoFacade realFacade = new SubstituicaoFacade(service);

		SubstituicaoComprovanteDTO dto = realFacade.substituir(1L, null);
		realFacade.atualizarMetadados(dto);

		assertNotNull(dto);
	}
}
