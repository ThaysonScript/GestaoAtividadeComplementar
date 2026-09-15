package br.edu.ufape.backend.notificacao.unidade.service;

import br.edu.ufape.backend.notificacao.exception.NotificacaoNaoEncontradaException;
import br.edu.ufape.backend.notificacao.model.Notificacao;
import br.edu.ufape.backend.notificacao.model.TipoNotificacao;
import br.edu.ufape.backend.notificacao.repository.NotificacaoRepository;
import br.edu.ufape.backend.notificacao.service.MensagemNotificacaoFactory;

import br.edu.ufape.backend.notificacao.service.NotificacaoService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificacaoServiceBranchTest {

	@Mock
	private NotificacaoRepository repository;

	@InjectMocks
	private NotificacaoService service;

	@Test
	@DisplayName("Branch MensagemNotificacaoFactory: status nulo, sem justificativa obrigatoria e status desconhecido")
	void deveValidarMensagemNotificacaoFactory() {
		assertThrows(IllegalArgumentException.class, () -> MensagemNotificacaoFactory.criar(null, "Motivo"));
		assertThrows(IllegalArgumentException.class, () -> MensagemNotificacaoFactory.criar("REJEITADA", null));
		assertThrows(IllegalArgumentException.class, () -> MensagemNotificacaoFactory.criar("COM_PENDENCIAS", "   "));
		assertThrows(IllegalArgumentException.class,
				() -> MensagemNotificacaoFactory.criar("STATUS_DESCONHECIDO", null));

		assertEquals(TipoNotificacao.SOLICITACAO_EM_ANALISE,
				MensagemNotificacaoFactory.criar("EM_ANALISE", null).tipo());
		assertEquals(TipoNotificacao.SOLICITACAO_REJEITADA,
				MensagemNotificacaoFactory.criar("REJEITADA", "Falta doc").tipo());
	}

	@Test
	@DisplayName("Branch NotificacaoService: Filtros na listagem por apenasNaoLidas")
	void deveListarComFiltros() {
		service.listar(1L, null);
		verify(repository).findByDestinatarioIdOrderByDataCriacaoDesc(1L);

		service.listar(1L, true);
		verify(repository).findByDestinatarioIdAndLidaOrderByDataCriacaoDesc(1L, false);

		service.listar(1L, false);
		verify(repository).findByDestinatarioIdAndLidaOrderByDataCriacaoDesc(1L, true);
	}

	@Test
    @DisplayName("Branch NotificacaoService: marcarComoLida com notificacao existente ou nao e ja lida")
    void deveMarcarComoLida() {
        when(repository.findByIdAndDestinatarioId(99L, 1L)).thenReturn(Optional.empty());
        assertThrows(NotificacaoNaoEncontradaException.class, () -> service.marcarComoLida(99L, 1L));

        Notificacao n1 = new Notificacao(1L, TipoNotificacao.SOLICITACAO_SUBMETIDA, "T", "M", 10L);
        when(repository.findByIdAndDestinatarioId(10L, 1L)).thenReturn(Optional.of(n1));
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));

        Notificacao alterada = service.marcarComoLida(10L, 1L);
        assertTrue(alterada.isLida());

        // Quando ja esta lida, apenas retorna sem salvar novamente
        service.marcarComoLida(10L, 1L);
        verify(repository, times(1)).save(any());
    }

	@Test
    @DisplayName("Branch NotificacaoService: marcarTodasComoLidas com lista vazia ou preenchida")
    void deveMarcarTodasComoLidas() {
        when(repository.findByDestinatarioIdAndLidaOrderByDataCriacaoDesc(1L, false)).thenReturn(List.of());
        assertEquals(0, service.marcarTodasComoLidas(1L));

        Notificacao n1 = new Notificacao(1L, TipoNotificacao.SOLICITACAO_SUBMETIDA, "T", "M", 10L);
        when(repository.findByDestinatarioIdAndLidaOrderByDataCriacaoDesc(1L, false)).thenReturn(List.of(n1));

        assertEquals(1, service.marcarTodasComoLidas(1L));
        assertTrue(n1.isLida());
        verify(repository).saveAll(any());
    }
}
