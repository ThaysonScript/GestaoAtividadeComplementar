package br.edu.ufape.backend.atividade.contrato;

import java.util.List;

import br.edu.ufape.backend.atividade.dto.AtividadeResponseDTO;
import br.edu.ufape.backend.atividade.exception.AcessoNegadoAtividadeException;
import br.edu.ufape.backend.atividade.model.Natureza;

public interface AtividadeContrato {
	/**
	 * @throws AcessoNegadoAtividadeException
	 *             se o email não existir ou não pertencer a um Estudante
	 */
	List<AtividadeResponseDTO> buscarPorEstudante(String emailEstudante);

	List<AtividadeResponseDTO> buscarPorEstudante(Long estudanteId);

	/**
	 * @throws AcessoNegadoAtividadeException
	 *             se o email não existir ou não pertencer a um Estudante
	 */
	List<AtividadeResponseDTO> buscarPorEstudanteENatureza(String emailEstudante, Natureza natureza);

	AtividadeResponseDTO buscarPorId(Long id);
}
