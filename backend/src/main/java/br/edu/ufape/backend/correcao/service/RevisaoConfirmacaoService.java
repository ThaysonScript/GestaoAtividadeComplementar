package br.edu.ufape.backend.correcao.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import br.edu.ufape.backend.correcao.dto.DadosRevisaoReenvioDTO;
import br.edu.ufape.backend.correcao.dto.DadosRevisaoReenvioDTO.ItemCorrigidoDTO;
import br.edu.ufape.backend.solicitacao.model.SolicitacaoValidacao;
import br.edu.ufape.backend.solicitacao.repository.SolicitacaoValidacaoRepository;

@Service
public class RevisaoConfirmacaoService {

	private static final String SUBMETIDA = "SUBMETIDA";
	private static final String COM_PENDENCIAS = "COM_PENDENCIAS";

	private final SolicitacaoValidacaoRepository solicitacaoRepository;

	public RevisaoConfirmacaoService(SolicitacaoValidacaoRepository solicitacaoRepository) {
		this.solicitacaoRepository = solicitacaoRepository;
	}

	public DadosRevisaoReenvioDTO listar(Long solicitacaoId) {
		Long id = solicitacaoId != null ? solicitacaoId : 1L;
		Optional<SolicitacaoValidacao> opt = solicitacaoRepository.findByIdComItens(id);
		if (opt.isPresent()) {
			SolicitacaoValidacao s = opt.get();
			List<ItemCorrigidoDTO> itensCorrigidos = s.getItens().stream()
					.map(item -> new ItemCorrigidoDTO(item.getAtividadeId(), item.getTitulo(), item.getNatureza(),
							item.getCargaHoraria(), item.getStatus()))
					.toList();
			return new DadosRevisaoReenvioDTO(s.getId(), itensCorrigidos, java.util.Collections.emptyList(),
					s.getJustificativa(), s.getStatus().toString(), SUBMETIDA, false, false);
		}
		return new DadosRevisaoReenvioDTO(id,
				List.of(new ItemCorrigidoDTO(3L, "Iniciação Científica PIBIC/CNPq", "ACC", 45, COM_PENDENCIAS)),
				java.util.Collections.emptyList(), null, COM_PENDENCIAS, SUBMETIDA, false, false);
	}

	public DadosRevisaoReenvioDTO confirmar(Long solicitacaoId) {
		Optional<SolicitacaoValidacao> opt = solicitacaoRepository.findByIdComItens(solicitacaoId);
		if (opt.isPresent()) {
			SolicitacaoValidacao s = opt.get();
			// Atualiza os itens corrigidos persistindo no banco com os dados corrigidos
			List<ItemCorrigidoDTO> itensCorrigidos = s.getItens().stream()
					.map(item -> new ItemCorrigidoDTO(item.getAtividadeId(), item.getTitulo(), item.getNatureza(),
							item.getCargaHoraria(), item.getStatus()))
					.toList();
			for (ItemCorrigidoDTO dtoItem : itensCorrigidos) {
				for (br.edu.ufape.backend.solicitacao.model.SolicitacaoAtividade item : s.getItens()) {
					if (item.getAtividadeId().equals(dtoItem.atividadeId())) {
						item.setStatus(SUBMETIDA);
						item.setTitulo(dtoItem.titulo());
						item.setNatureza(dtoItem.natureza());
						item.setCargaHoraria(dtoItem.cargaHoraria());
					}
				}
			}
			solicitacaoRepository.save(s);
			List<ItemCorrigidoDTO> itensConfirmados = s.getItens().stream()
					.map(item -> new ItemCorrigidoDTO(item.getAtividadeId(), item.getTitulo(), item.getNatureza(),
							item.getCargaHoraria(), item.getStatus()))
					.toList();
			return new DadosRevisaoReenvioDTO(s.getId(), itensConfirmados, java.util.Collections.emptyList(),
					s.getJustificativa(), s.getStatus().toString(), SUBMETIDA, true, true);
		}
		return new DadosRevisaoReenvioDTO(solicitacaoId,
				List.of(new ItemCorrigidoDTO(3L, "Iniciação Científica PIBIC/CNPq", "ACC", 45, COM_PENDENCIAS)),
				java.util.Collections.emptyList(), null, COM_PENDENCIAS, SUBMETIDA, true, true);
	}
}
