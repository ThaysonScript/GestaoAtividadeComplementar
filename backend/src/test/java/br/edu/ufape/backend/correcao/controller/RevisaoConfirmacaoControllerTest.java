package br.edu.ufape.backend.correcao.controller;

import br.edu.ufape.backend.correcao.dto.DadosRevisaoReenvioDTO;
import br.edu.ufape.backend.correcao.facade.RevisaoConfirmacaoFacade;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import org.springframework.http.MediaType;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class RevisaoConfirmacaoControllerTest {

	private MockMvc mockMvc;

	@Mock
	private RevisaoConfirmacaoFacade facade;

	@InjectMocks
	private RevisaoConfirmacaoController controller;

	@BeforeEach
	void setUp() {
		mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
	}

	@Test
	@DisplayName("Deve listar dados de revisao para reenvio")
	void deveListarDadosRevisao() throws Exception {
		DadosRevisaoReenvioDTO dto = new DadosRevisaoReenvioDTO(1L, List.of(), List.of(), "Ajustar documento",
				"INDEFERIDA", "EM_REVISAO", false, false);
		when(facade.listar(1L)).thenReturn(dto);

		mockMvc.perform(get("/api/v1/revisao-confirmacao").param("solicitacaoId", "1")).andExpect(status().isOk())
				.andExpect(jsonPath("$.solicitacaoId").value(1L))
				.andExpect(jsonPath("$.observacoesAvaliador").value("Ajustar documento"))
				.andExpect(jsonPath("$.confirmado").value(false));
	}

	@Test
	@DisplayName("Deve listar dados de revisao sem solicitar id")
	void deveListarDadosRevisaoSemId() throws Exception {
		DadosRevisaoReenvioDTO dto = new DadosRevisaoReenvioDTO(1L, List.of(), List.of(), "Ajustar documento",
				"INDEFERIDA", "EM_REVISAO", false, false);
		when(facade.listar(1L)).thenReturn(dto);

		mockMvc.perform(get("/api/v1/revisao-confirmacao")).andExpect(status().isOk())
				.andExpect(jsonPath("$.solicitacaoId").value(1L));
	}

	@Test
	@DisplayName("Deve confirmar reenvio de solicitacao")
	void deveConfirmarReenvio() throws Exception {
		DadosRevisaoReenvioDTO dto = new DadosRevisaoReenvioDTO(1L, List.of(), List.of(), "Ajustar documento",
				"INDEFERIDA", "EM_REVISAO", false, true);
		when(facade.confirmar(1L)).thenReturn(dto);

		mockMvc.perform(patch("/api/v1/revisao-confirmacao").contentType(MediaType.APPLICATION_JSON)
				.content("{\"solicitacaoId\":1,\"confirmado\":true}")).andExpect(status().isOk())
				.andExpect(jsonPath("$.solicitacaoId").value(1L)).andExpect(jsonPath("$.confirmado").value(true));
	}
}
