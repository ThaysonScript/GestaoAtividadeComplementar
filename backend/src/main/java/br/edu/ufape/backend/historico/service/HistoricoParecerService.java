package br.edu.ufape.backend.historico.service;

import java.util.List;

import org.springframework.stereotype.Service;

import br.edu.ufape.backend.historico.dto.AtividadeComHistoricoParecerDTO;
import br.edu.ufape.backend.historico.dto.ParecerAvaliadorHistoricoDTO;
import br.edu.ufape.backend.solicitacao.repository.SolicitacaoValidacaoRepository;

@Service
public class HistoricoParecerService {

	private static final String COM_PENDENCIAS = "COM_PENDENCIAS";
	private static final String REJEITADA = "REJEITADA";
	private static final String CORRECAO = "CORRECAO";

	private final SolicitacaoValidacaoRepository repository;

	public HistoricoParecerService(SolicitacaoValidacaoRepository repository) {
		this.repository = repository;
	}

	public List<AtividadeComHistoricoParecerDTO> listarPorEstudante() {
		return repository.findAll().stream()
				.filter(s -> s.getStatus() != null && temStatusRelevante(s.getStatus().name()))
				.map(this::mapearAtividade).toList();
	}

	public List<ParecerAvaliadorHistoricoDTO> buscarPorAtividade(Long id) {
		return repository.findById(id).map(s -> s.getItens().stream().map(item -> mapearParecerItem(s, item)).toList())
				.orElse(List.of());
	}

	private boolean temStatusRelevante(String status) {
		return COM_PENDENCIAS.equals(status) || REJEITADA.equals(status);
	}

	private AtividadeComHistoricoParecerDTO mapearAtividade(
			br.edu.ufape.backend.solicitacao.model.SolicitacaoValidacao s) {
		String statusNome = s.getStatus().name();
		boolean comPendencias = COM_PENDENCIAS.equals(statusNome);
		String titulo = s.getItens().isEmpty() ? "" : s.getItens().get(0).getTitulo();
		String natureza = s.getItens().isEmpty() ? "" : s.getItens().get(0).getNatureza();
		String categoria = s.getItens().isEmpty() ? "" : "ENSINO";
		int cargaHoraria = s.getItens().isEmpty() ? 0 : s.getItens().get(0).getCargaHoraria();
		return new AtividadeComHistoricoParecerDTO(s.getId(), titulo, natureza, categoria, cargaHoraria, statusNome,
				comPendencias, s.getItens().stream().map(item -> mapearParecerItem(s, item)).toList());
	}

	private ParecerAvaliadorHistoricoDTO mapearParecerItem(
			br.edu.ufape.backend.solicitacao.model.SolicitacaoValidacao s,
			br.edu.ufape.backend.solicitacao.model.SolicitacaoAtividade item) {
		String statusNome = s.getStatus().name();
		String acao = temStatusRelevante(statusNome) ? CORRECAO : statusNome;
		return new ParecerAvaliadorHistoricoDTO(item.getId(), item.getAtividadeId(),
				s.getDataAvaliacao() != null ? s.getDataAvaliacao().toString() : null, statusNome, acao,
				s.getJustificativa(), "Reenviar corrigido.", "Art. 12", item.getCargaHoraria());
	}

}
