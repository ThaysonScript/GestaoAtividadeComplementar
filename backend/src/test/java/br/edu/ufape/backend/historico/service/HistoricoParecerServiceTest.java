package br.edu.ufape.backend.historico.service;

import br.edu.ufape.backend.historico.dto.AtividadeComHistoricoParecerDTO;
import br.edu.ufape.backend.historico.dto.ParecerAvaliadorHistoricoDTO;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HistoricoParecerServiceTest {

	@Mock
	private SolicitacaoValidacaoRepository repository;

	@InjectMocks
	private HistoricoParecerService service;

	@Test
	@DisplayName("deve listar por estudante com COM_PENDENCIAS")
	void deveListarPorEstudanteComPendencias() {
		SolicitacaoAtividade item = new SolicitacaoAtividade(1L, "Monitoria", 30, "ACC");
		SolicitacaoValidacao s = new SolicitacaoValidacao(10L, LocalDateTime.now(), StatusSolicitacao.COM_PENDENCIAS,
				List.of(item));
		s.setId(1L);

		when(repository.findAll()).thenReturn(List.of(s));

		List<AtividadeComHistoricoParecerDTO> result = service.listarPorEstudante();
		assertFalse(result.isEmpty());
		assertEquals("COM_PENDENCIAS", result.get(0).statusAtual());
	}

	@Test
	@DisplayName("deve listar por estudante com REJEITADA")
	void deveListarPorEstudanteComRejeitada() {
		SolicitacaoAtividade item = new SolicitacaoAtividade(2L, "Evento", 20, "ACEX");
		SolicitacaoValidacao s = new SolicitacaoValidacao(11L, LocalDateTime.now(), StatusSolicitacao.REJEITADA,
				List.of(item));
		s.setId(2L);

		when(repository.findAll()).thenReturn(List.of(s));

		List<AtividadeComHistoricoParecerDTO> result = service.listarPorEstudante();
		assertFalse(result.isEmpty());
		assertEquals("REJEITADA", result.get(0).statusAtual());
	}

	@Test
	@DisplayName("deve retornar vazio quando nao ha COM_PENDENCIAS ou REJEITADA")
	void deveRetornarVazioQuandoStatusDiferente() {
		SolicitacaoAtividade item = new SolicitacaoAtividade(3L, "Outro", 30, "ACC");
		SolicitacaoValidacao s = new SolicitacaoValidacao(12L, LocalDateTime.now(), StatusSolicitacao.SUBMETIDA,
				List.of(item));
		s.setId(3L);

		when(repository.findAll()).thenReturn(List.of(s));

		List<AtividadeComHistoricoParecerDTO> result = service.listarPorEstudante();
		assertTrue(result.isEmpty());
	}

	@Test
	@DisplayName("deve buscar por atividade quando existe")
	void deveBuscarPorAtividadeQuandoExiste() {
		SolicitacaoAtividade item = new SolicitacaoAtividade(4L, "Pesquisa", 45, "ACC");
		SolicitacaoValidacao s = new SolicitacaoValidacao(13L, LocalDateTime.now(), StatusSolicitacao.COM_PENDENCIAS,
				List.of(item));
		s.setId(4L);

		when(repository.findById(4L)).thenReturn(Optional.of(s));

		List<ParecerAvaliadorHistoricoDTO> result = service.buscarPorAtividade(4L);
		assertFalse(result.isEmpty());
		assertEquals("COM_PENDENCIAS", result.get(0).statusSolicitacao());
	}

	@Test
	@DisplayName("deve buscar por atividade quando nao existe")
	void deveBuscarPorAtividadeQuandoNaoExiste() {
		when(repository.findById(99L)).thenReturn(Optional.empty());

		List<ParecerAvaliadorHistoricoDTO> result = service.buscarPorAtividade(99L);
		assertTrue(result.isEmpty());
	}

	@Test
	@DisplayName("deve retornar CORRECAO para COM_PENDENCIAS no buscarPorAtividade")
	void deveRetornarCorrecaoParaComPendencias() {
		SolicitacaoAtividade item = new SolicitacaoAtividade(5L, "Monitoria 2", 30, "ACC");
		SolicitacaoValidacao s = new SolicitacaoValidacao(14L, LocalDateTime.now(), StatusSolicitacao.COM_PENDENCIAS,
				List.of(item));
		s.setId(5L);

		when(repository.findById(5L)).thenReturn(Optional.of(s));

		List<ParecerAvaliadorHistoricoDTO> result = service.buscarPorAtividade(5L);
		assertEquals("CORRECAO", result.get(0).tipoParecer());
	}

	@Test
	@DisplayName("deve retornar CORRECAO para REJEITADA no buscarPorAtividade")
	void deveRetornarCorrecaoParaRejeitada() {
		SolicitacaoAtividade item = new SolicitacaoAtividade(6L, "Evento 2", 20, "ACEX");
		SolicitacaoValidacao s = new SolicitacaoValidacao(15L, LocalDateTime.now(), StatusSolicitacao.REJEITADA,
				List.of(item));
		s.setId(6L);

		when(repository.findById(6L)).thenReturn(Optional.of(s));

		List<ParecerAvaliadorHistoricoDTO> result = service.buscarPorAtividade(6L);
		assertEquals("CORRECAO", result.get(0).tipoParecer());
	}
}
