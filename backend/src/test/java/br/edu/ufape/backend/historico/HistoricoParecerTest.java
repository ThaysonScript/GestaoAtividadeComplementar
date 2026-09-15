package br.edu.ufape.backend.historico;

import br.edu.ufape.backend.historico.controller.HistoricoParecerController;
import br.edu.ufape.backend.historico.facade.HistoricoParecerFacade;
import br.edu.ufape.backend.historico.service.HistoricoParecerService;
import br.edu.ufape.backend.solicitacao.repository.SolicitacaoValidacaoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class HistoricoParecerTest {

	@Mock
	private SolicitacaoValidacaoRepository repository;

	private MockMvc mockMvc;
	private HistoricoParecerService service;

	@BeforeEach
	void setUp() {
		service = new HistoricoParecerService(repository);
		HistoricoParecerFacade facade = new HistoricoParecerFacade(service);
		HistoricoParecerController controller = new HistoricoParecerController(facade);
		mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
	}

	@Test
	void deveListarHistoricoEBuscarPorAtividade() throws Exception {
		mockMvc.perform(get("/api/v1/historico-pareceres")).andExpect(status().isOk());

		mockMvc.perform(get("/api/v1/historico-pareceres/atividade/1")).andExpect(status().isOk());

		assertTrue(service.listarPorEstudante().isEmpty());
		assertTrue(service.buscarPorAtividade(1L).isEmpty());
	}
}
