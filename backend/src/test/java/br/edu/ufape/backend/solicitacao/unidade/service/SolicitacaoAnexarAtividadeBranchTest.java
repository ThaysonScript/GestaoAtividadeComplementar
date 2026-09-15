package br.edu.ufape.backend.solicitacao.unidade.service;

import br.edu.ufape.backend.atividade.contrato.AtividadeContrato;
import br.edu.ufape.backend.atividade.dto.AtividadeResponseDTO;
import br.edu.ufape.backend.atividade.model.Categoria;
import br.edu.ufape.backend.notificacao.contrato.NotificacaoContrato;
import br.edu.ufape.backend.solicitacao.exception.SolicitacaoEmAbertoException;
import br.edu.ufape.backend.solicitacao.exception.SolicitacaoNaoEncontradaException;
import br.edu.ufape.backend.solicitacao.model.SolicitacaoAtividade;
import br.edu.ufape.backend.solicitacao.model.SolicitacaoValidacao;
import br.edu.ufape.backend.solicitacao.model.StatusSolicitacao;
import br.edu.ufape.backend.solicitacao.repository.SolicitacaoValidacaoRepository;
import br.edu.ufape.backend.solicitacao.service.SolicitacaoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SolicitacaoAnexarAtividadeBranchTest {

	@Mock
	private SolicitacaoValidacaoRepository solicitacaoRepository;
	@Mock
	private AtividadeContrato atividadeContrato;
	@Mock
	private NotificacaoContrato notificacaoContrato;

	private SolicitacaoService service;

	@BeforeEach
	void setUp() {
		service = new SolicitacaoService(solicitacaoRepository, atividadeContrato, notificacaoContrato);
	}

	@Test
    @DisplayName("Branch: Solicitacao nao encontrada ao anexar atividade")
    void deveLancarExcecaoQuandoSolicitacaoNaoExiste() {
        when(solicitacaoRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(SolicitacaoNaoEncontradaException.class, () -> service.anexarAtividade(99L, 1L));
    }

	@Test
	@DisplayName("Branch: Solicitacao ja finalizada (ex: APROVADA) nao permite anexar atividades")
	void deveLancarExcecaoQuandoSolicitacaoNaoEstaEmAberto() {
		SolicitacaoValidacao s = new SolicitacaoValidacao(1L);
		s.setStatus(StatusSolicitacao.APROVADA);
		when(solicitacaoRepository.findById(1L)).thenReturn(Optional.of(s));

		assertThrows(SolicitacaoEmAbertoException.class, () -> service.anexarAtividade(1L, 2L));
	}

	@Test
	@DisplayName("Branch: AtividadeId nulo ou ja anexado lança IllegalArgumentException")
	void deveValidarAtividadeIdEAtividadeJaAnexada() {
		SolicitacaoValidacao s = new SolicitacaoValidacao(1L);
		s.setStatus(StatusSolicitacao.SUBMETIDA);
		s.getItens().add(new SolicitacaoAtividade(10L, "Curso A", 20, "ACC"));

		when(solicitacaoRepository.findById(1L)).thenReturn(Optional.of(s));

		assertThrows(IllegalArgumentException.class, () -> service.anexarAtividade(1L, null));
		assertThrows(IllegalArgumentException.class, () -> service.anexarAtividade(1L, 10L));
	}

	@Test
	@DisplayName("Branch: Anexar atividade com sucesso em solicitacao EM_ANALISE e natureza nula")
	void deveAnexarAtividadeComSucesso() {
		SolicitacaoValidacao s = new SolicitacaoValidacao(1L);
		s.setStatus(StatusSolicitacao.EM_ANALISE);
		s.setItens(new ArrayList<>());

		when(solicitacaoRepository.findById(1L)).thenReturn(Optional.of(s));

		AtividadeResponseDTO ativ = new AtividadeResponseDTO(20L, "Nova Atividade", "UFAPE", LocalDate.now(), 30, null,
				Categoria.EXTENSAO, LocalDateTime.now(), "a@u.br");
		when(atividadeContrato.buscarPorId(20L)).thenReturn(ativ);
		when(solicitacaoRepository.save(any())).thenAnswer(i -> i.getArgument(0));

		SolicitacaoValidacao result = service.anexarAtividade(1L, 20L);

		assertEquals(1, result.getItens().size());
		assertEquals(20L, result.getItens().get(0).getAtividadeId());
		assertNull(result.getItens().get(0).getNatureza());
		verify(notificacaoContrato).notificarMudancaStatusSolicitacao(eq(1L), any(), eq("EM_ANALISE"), isNull());
	}
}
