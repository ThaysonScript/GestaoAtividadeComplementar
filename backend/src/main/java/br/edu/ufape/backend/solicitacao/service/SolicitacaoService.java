package br.edu.ufape.backend.solicitacao.service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.ufape.backend.atividade.contrato.AtividadeContrato;
import br.edu.ufape.backend.atividade.dto.AtividadeResponseDTO;
import br.edu.ufape.backend.notificacao.contrato.NotificacaoContrato;
import br.edu.ufape.backend.solicitacao.dto.SolicitacaoResumoResponseDTO;
import br.edu.ufape.backend.solicitacao.exception.EstudanteSemAtividadesException;
import br.edu.ufape.backend.solicitacao.exception.SolicitacaoEmAbertoException;
import br.edu.ufape.backend.solicitacao.exception.SolicitacaoNaoEncontradaException;
import br.edu.ufape.backend.solicitacao.model.DecisaoAvaliacao;
import br.edu.ufape.backend.solicitacao.model.SolicitacaoAtividade;
import br.edu.ufape.backend.solicitacao.model.SolicitacaoValidacao;
import br.edu.ufape.backend.solicitacao.model.StatusSolicitacao;
import br.edu.ufape.backend.solicitacao.repository.SolicitacaoValidacaoRepository;

@Service
public class SolicitacaoService {

	private final SolicitacaoValidacaoRepository solicitacaoValidacaoRepository;
	private final AtividadeContrato atividadeContrato;
	private final NotificacaoContrato notificacaoContrato;

	public SolicitacaoService(SolicitacaoValidacaoRepository solicitacaoValidacaoRepository,
			AtividadeContrato atividadeContrato, NotificacaoContrato notificacaoContrato) {
		this.solicitacaoValidacaoRepository = solicitacaoValidacaoRepository;
		this.atividadeContrato = atividadeContrato;
		this.notificacaoContrato = notificacaoContrato;
	}

	// ---- Submissao pelo estudante ----

	@Transactional
	public SolicitacaoValidacao submeter(Long estudanteId) {
		if (solicitacaoValidacaoRepository.existsByEstudanteIdAndStatusIn(estudanteId,
				StatusSolicitacao.STATUS_EM_ABERTO)) {
			throw new SolicitacaoEmAbertoException(
					"Ja existe uma solicitacao de validacao em aberto para este estudante.");
		}

		List<AtividadeResponseDTO> atividades = atividadeContrato.buscarPorEstudante(estudanteId);

		if (atividades == null || atividades.isEmpty()) {
			throw new EstudanteSemAtividadesException(
					"Nao e possivel submeter solicitacao sem atividades complementares cadastradas.");
		}

		List<SolicitacaoAtividade> itensSnapshot = atividades.stream().map(a -> new SolicitacaoAtividade(a.id(),
				a.titulo(), a.cargaHorariaEmHoras(), a.natureza() != null ? a.natureza().name() : null)).toList();

		SolicitacaoValidacao solicitacao = new SolicitacaoValidacao(estudanteId,
				LocalDateTime.now(ZoneId.of("America/Recife")), StatusSolicitacao.SUBMETIDA,
				new ArrayList<>(itensSnapshot));

		SolicitacaoValidacao solicitacaoSalva = solicitacaoValidacaoRepository.save(solicitacao);
		notificacaoContrato.notificarMudancaStatusSolicitacao(solicitacaoSalva.getEstudanteId(),
				solicitacaoSalva.getId(), solicitacaoSalva.getStatus().name(), null);
		return solicitacaoSalva;
	}

	// ---- Avaliacao pelo avaliador ----

	@Transactional
	public SolicitacaoValidacao avaliar(Long solicitacaoId, Long avaliadorId, DecisaoAvaliacao decisao,
			String justificativa) {
		SolicitacaoValidacao solicitacao = solicitacaoValidacaoRepository.findById(solicitacaoId)
				.orElseThrow(() -> new SolicitacaoNaoEncontradaException(solicitacaoId));

		StatusSolicitacao novoStatus = decisao.toStatus();
		MaquinaEstadosSolicitacao.validar(solicitacao.getStatus(), novoStatus);

		if ((novoStatus == StatusSolicitacao.REJEITADA || novoStatus == StatusSolicitacao.COM_PENDENCIAS)
				&& (justificativa == null || justificativa.isBlank())) {
			throw new IllegalArgumentException("Justificativa e obrigatoria para decisao " + novoStatus);
		}

		solicitacao.setStatus(novoStatus);
		solicitacao.setJustificativa(justificativa);
		solicitacao.setAvaliadorId(avaliadorId);
		solicitacao.setDataAvaliacao(LocalDateTime.now(ZoneId.of("America/Recife")));

		SolicitacaoValidacao solicitacaoSalva = solicitacaoValidacaoRepository.save(solicitacao);
		notificacaoContrato.notificarMudancaStatusSolicitacao(solicitacaoSalva.getEstudanteId(),
				solicitacaoSalva.getId(), novoStatus.name(), justificativa);
		return solicitacaoSalva;
	}

	// ---- Metodos do contrato publico ----

	@Transactional(readOnly = true)
	public List<SolicitacaoResumoResponseDTO> listarDoEstudante(Long estudanteId) {
		return solicitacaoValidacaoRepository.findResumosByEstudanteIdOrderByDataSubmissaoDesc(estudanteId);
	}

	@Transactional(readOnly = true)
	public SolicitacaoValidacao detalhar(Long estudanteId, Long solicitacaoId) {
		return solicitacaoValidacaoRepository.findByIdAndEstudanteId(solicitacaoId, estudanteId)
				.orElseThrow(() -> new SolicitacaoNaoEncontradaException("Solicitação não encontrada."));
	}

	@Transactional(readOnly = true)
	public boolean existeSolicitacaoEmAbertoComAtividade(Long atividadeId) {
		return solicitacaoValidacaoRepository.existsByAtividadeIdAndStatusIn(atividadeId,
				StatusSolicitacao.STATUS_EM_ABERTO);
	}

	@Transactional(readOnly = true)
	public boolean existeSolicitacaoEmAbertoDoEstudante(Long estudanteId) {
		return solicitacaoValidacaoRepository.existsByEstudanteIdAndStatusIn(estudanteId,
				StatusSolicitacao.STATUS_EM_ABERTO);
	}

	@Transactional(readOnly = true)
	public List<SolicitacaoValidacao> listarParaAvaliacao(StatusSolicitacao status) {
		return solicitacaoValidacaoRepository.findByStatusOrderByDataSubmissaoDesc(status);
	}

	public SolicitacaoValidacao avaliarPorAtividade(Long solicitacaoId, Long atividadeId, String status, String justificativa) {
		SolicitacaoValidacao solicitacao = solicitacaoValidacaoRepository.findById(solicitacaoId)
				.orElseThrow(() -> new SolicitacaoNaoEncontradaException(solicitacaoId));

		solicitacao.getItens().stream()
				.filter(i -> i.getAtividadeId().equals(atividadeId))
				.findFirst()
				.ifPresent(i -> {
					i.setStatus(status);
					i.setJustificativa(justificativa);
				});

		return solicitacaoValidacaoRepository.save(solicitacao);
	}

	@Transactional(readOnly = true)
	public SolicitacaoValidacao detalharParaAvaliacao(Long solicitacaoId) {
		return solicitacaoValidacaoRepository.findByIdComItens(solicitacaoId)
				.orElseThrow(() -> new SolicitacaoNaoEncontradaException(solicitacaoId));
	}
}
