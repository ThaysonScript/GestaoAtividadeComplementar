package br.edu.ufape.backend.notificacao.controller;

import br.edu.ufape.backend.notificacao.facade.NotificacaoFacade;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class NotificacaoControllerTest {

	private MockMvc mockMvc;

	@Mock
	private NotificacaoFacade facade;

	@InjectMocks
	private NotificacaoController controller;

	@BeforeEach
	void setUp() {
		mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
	}

	@Test
	@DisplayName("deve listar notificacoes")
	void deveListarNotificacoes() throws Exception {
		when(facade.listar("estudante@ufape.edu.br", null)).thenReturn(Collections.emptyList());

		mockMvc.perform(get("/api/v1/notificacoes")
				.principal(new UsernamePasswordAuthenticationToken("estudante@ufape.edu.br", "password")))
			.andExpect(status().isOk());
	}

	@Test
	@DisplayName("deve contar nao lidas")
	void deveContarNaoLidas() throws Exception {
		when(facade.contarNaoLidas("estudante@ufape.edu.br")).thenReturn(new br.edu.ufape.backend.notificacao.dto.ContagemNaoLidasResponseDTO(0));

		mockMvc.perform(get("/api/v1/notificacoes/contagem-nao-lidas")
				.principal(new UsernamePasswordAuthenticationToken("estudante@ufape.edu.br", "password")))
			.andExpect(status().isOk());
	}

	@Test
	@DisplayName("deve marcar como lida")
	void deveMarcarComoLida() throws Exception {
		when(facade.marcarComoLida("estudante@ufape.edu.br", 1L)).thenReturn(null);

		mockMvc.perform(patch("/api/v1/notificacoes/1/leitura")
				.principal(new UsernamePasswordAuthenticationToken("estudante@ufape.edu.br", "password")))
			.andExpect(status().isOk());
	}

	@Test
	@DisplayName("deve marcar todas como lidas")
	void deveMarcarTodasComoLidas() throws Exception {
		mockMvc.perform(patch("/api/v1/notificacoes/leitura")
				.principal(new UsernamePasswordAuthenticationToken("estudante@ufape.edu.br", "password")))
				.andExpect(status().isNoContent());
	}

	@Test
	@DisplayName("deve retornar 401 quando nao autenticado")
	void deveRetornar401QuandoNaoAutenticado() throws Exception {
		mockMvc.perform(get("/api/v1/notificacoes")).andExpect(status().isUnauthorized());
	}
}
