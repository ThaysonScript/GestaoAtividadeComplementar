package br.edu.ufape.backend.atividade.contrato;

import java.util.List;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import br.edu.ufape.backend.atividade.dto.AtividadeResponseDTO;
import br.edu.ufape.backend.atividade.model.Natureza;
import br.edu.ufape.backend.atividade.service.AtividadeComplementarService;

@Component
public class AtividadeContratoImpl implements AtividadeContrato {

	private final AtividadeComplementarService atividadeComplementarService;

	public AtividadeContratoImpl(AtividadeComplementarService atividadeComplementarService) {
		this.atividadeComplementarService = atividadeComplementarService;
	}

	@Override
	@Transactional(readOnly = true)
	public List<AtividadeResponseDTO> buscarPorEstudante(String emailEstudante) {
		return atividadeComplementarService.listarAtividadesDoEstudante(emailEstudante, null, null).stream()
				.map(AtividadeResponseDTO::new).toList();
	}

	@Override
	@Transactional(readOnly = true)
	public List<AtividadeResponseDTO> buscarPorEstudante(Long estudanteId) {
		return atividadeComplementarService.listarAtividadesDoEstudante(estudanteId).stream()
				.map(AtividadeResponseDTO::new).toList();
	}

	@Override
	@Transactional(readOnly = true)
	public AtividadeResponseDTO buscarPorId(Long id) {
		return new AtividadeResponseDTO(atividadeComplementarService.buscarPorId(id));
	}

	@Override
	@Transactional(readOnly = true)
	public List<AtividadeResponseDTO> buscarPorEstudanteENatureza(String emailEstudante, Natureza natureza) {
		return atividadeComplementarService.listarAtividadesDoEstudante(emailEstudante, natureza, null).stream()
				.map(AtividadeResponseDTO::new).toList();
	}
}
