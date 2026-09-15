package br.edu.ufape.backend.correcao.unidade.service;

import br.edu.ufape.backend.correcao.dto.DadosRevisaoReenvioDTO;
import br.edu.ufape.backend.correcao.service.RevisaoConfirmacaoService;
import br.edu.ufape.backend.solicitacao.model.SolicitacaoAtividade;
import br.edu.ufape.backend.solicitacao.model.SolicitacaoValidacao;
import br.edu.ufape.backend.solicitacao.model.StatusSolicitacao;
import br.edu.ufape.backend.solicitacao.repository.SolicitacaoValidacaoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RevisaoConfirmacaoServiceBranchTest {

	@Mock
	private SolicitacaoValidacaoRepository solicitacaoRepository;

	@InjectMocks
	private RevisaoConfirmacaoService service;

	@Test
	@DisplayName("Branch: Listar e Confirmar reenvio quando solicitacao existir no banco")
	void deveListarEConfirmarComSolicitacaoExistente() {
		SolicitacaoAtividade item = new SolicitacaoAtividade(1L, "Atividade A", 30, "ACC");
		SolicitacaoValidacao s = new SolicitacaoValidacao(10L, LocalDateTime.now(), StatusSolicitacao.COM_PENDENCIAS,
				List.of(item));
		s.setId(1L);

		when(solicitacaoRepository.findByIdComItens(1L)).thenReturn(Optional.of(s));

		DadosRevisaoReenvioDTO dto1 = service.listar(1L);
		assertNotNull(dto1);
		assertEquals(1L, dto1.solicitacaoId());
		assertFalse(dto1.confirmado());

		DadosRevisaoReenvioDTO dto2 = service.confirmar(1L);
		assertNotNull(dto2);
		assertTrue(dto2.confirmado());
	}

	@Test
    @DisplayName("Branch: Listar e Confirmar reenvio com solicitacao nula/ausente caindo no fallback")
    void deveUsarFallbackQuandoSolicitacaoNaoExistir() {
        when(solicitacaoRepository.findByIdComItens(1L)).thenReturn(Optional.empty());
        when(solicitacaoRepository.findByIdComItens(99L)).thenReturn(Optional.empty());

        DadosRevisaoReenvioDTO dtoListar = service.listar(null);
        assertNotNull(dtoListar);

        DadosRevisaoReenvioDTO dtoConfirmar = service.confirmar(99L);
        assertNotNull(dtoConfirmar);
        assertTrue(dtoConfirmar.confirmado());
    }
}
