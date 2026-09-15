package br.edu.ufape.backend.historico.controller;

import br.edu.ufape.backend.historico.facade.HistoricoParecerFacade;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class HistoricoParecerControllerTest {

	private MockMvc mockMvc;

	@Mock
	private HistoricoParecerFacade facade;

	@InjectMocks
	private HistoricoParecerController controller;

	@BeforeEach
	void setUp() {
		mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
	}

	@Test
    @DisplayName("Deve listar historico de pareceres do estudante")
    void deveListarHistoricoPareceres() throws Exception {
        when(facade.listarPorEstudante()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/historico-pareceres"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

	@Test
    @DisplayName("Deve buscar historico de pareceres por id de atividade")
    void deveBuscarHistoricoPorAtividade() throws Exception {
        when(facade.buscarPorAtividade(1L)).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/historico-pareceres/atividade/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
