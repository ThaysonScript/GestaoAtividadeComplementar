package br.edu.ufape.backend.correcao.facade;

import br.edu.ufape.backend.correcao.dto.DadosRevisaoReenvioDTO;
import br.edu.ufape.backend.correcao.service.RevisaoConfirmacaoService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;

import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@ExtendWith(MockitoExtension.class)
class RevisaoConfirmacaoFacadeTest {

	@Mock
	private RevisaoConfirmacaoService service;

	@InjectMocks
	private RevisaoConfirmacaoFacade facade;

	@Test
	@DisplayName("listar delega")
	void listarDelegates() {
		when(service.listar(1L)).thenReturn(new DadosRevisaoReenvioDTO(1L, Collections.emptyList(), Collections.emptyList(),
				null, "COM_PENDENCIAS", "SUBMETIDA", false, false));
		assertNotNull(facade.listar(1L));
	}
}
