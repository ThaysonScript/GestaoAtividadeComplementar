package br.edu.ufape.backend.solicitacao.facade;

import java.util.List;

import org.springframework.stereotype.Component;

import br.edu.ufape.backend.atividade.exception.AcessoNegadoAtividadeException;
import br.edu.ufape.backend.autenticacao.exception.UnauthorizedException;
import br.edu.ufape.backend.solicitacao.dto.SolicitacaoAvaliadorDetalheResponseDTO;
import br.edu.ufape.backend.solicitacao.dto.SolicitacaoAvaliadorResumoResponseDTO;
import br.edu.ufape.backend.solicitacao.dto.SolicitacaoDetalheResponseDTO;
import br.edu.ufape.backend.solicitacao.dto.SolicitacaoResponseDTO;
import br.edu.ufape.backend.solicitacao.dto.SolicitacaoResumoResponseDTO;
import br.edu.ufape.backend.solicitacao.model.DecisaoAvaliacao;
import br.edu.ufape.backend.solicitacao.model.SolicitacaoValidacao;
import br.edu.ufape.backend.solicitacao.model.StatusSolicitacao;
import br.edu.ufape.backend.solicitacao.service.SolicitacaoService;
import br.edu.ufape.backend.usuario.contrato.UsuarioContrato;
import br.edu.ufape.backend.usuario.model.Estudante;
import br.edu.ufape.backend.usuario.model.Usuario;

@Component
public class SolicitacaoFacade {

	private final SolicitacaoService solicitacaoService;
	private final UsuarioContrato usuarioContrato;

	public SolicitacaoFacade(SolicitacaoService solicitacaoService, UsuarioContrato usuarioContrato) {
		this.solicitacaoService = solicitacaoService;
		this.usuarioContrato = usuarioContrato;
	}

	// ---- Submissao pelo estudante ----

	public SolicitacaoResponseDTO submeter(String emailEstudante) {
		Usuario usuario = obterEstudante(emailEstudante);
		SolicitacaoValidacao solicitacao = solicitacaoService.submeter(usuario.getId());
		return new SolicitacaoResponseDTO(solicitacao);
	}

	public SolicitacaoResponseDTO anexarAtividade(String emailEstudante, Long solicitacaoId, Long atividadeId) {
		Usuario usuario = obterEstudante(emailEstudante);
		SolicitacaoValidacao resultado = solicitacaoService.anexarAtividade(solicitacaoId, atividadeId);
		return new SolicitacaoResponseDTO(resultado);
	}

	public SolicitacaoResponseDTO submeter(Long estudanteId) {
		SolicitacaoValidacao solicitacao = solicitacaoService.submeter(estudanteId);
		return new SolicitacaoResponseDTO(solicitacao);
	}

	public List<SolicitacaoResumoResponseDTO> listarDoEstudante(String emailEstudante) {
		Usuario usuario = obterEstudante(emailEstudante);
		return solicitacaoService.listarDoEstudante(usuario.getId());
	}

	public SolicitacaoDetalheResponseDTO detalhar(String emailEstudante, Long solicitacaoId) {
		Usuario usuario = obterEstudante(emailEstudante);
		SolicitacaoValidacao solicitacao = solicitacaoService.detalhar(usuario.getId(), solicitacaoId);
		return new SolicitacaoDetalheResponseDTO(solicitacao);
	}

	// ---- Avaliacao pelo avaliador ----

	public SolicitacaoDetalheResponseDTO avaliar(Long solicitacaoId, String avaliadorEmail, DecisaoAvaliacao decisao,
			String justificativa) {
		Long avaliadorId = usuarioContrato.buscarPorEmail(avaliadorEmail)
				.orElseThrow(() -> new UnauthorizedException("Avaliador nao encontrado ou nao autenticado.")).getId();

		SolicitacaoValidacao resultado = solicitacaoService.avaliar(solicitacaoId, avaliadorId, decisao, justificativa);
		return new SolicitacaoDetalheResponseDTO(resultado);
	}

	public List<SolicitacaoAvaliadorResumoResponseDTO> listarParaAvaliacao(StatusSolicitacao status) {
		List<SolicitacaoValidacao> solicitacoes = solicitacaoService.listarParaAvaliacao(status);
		return solicitacoes.stream().map(solicitacao -> {
			String estudanteNome = usuarioContrato.buscarPorId(solicitacao.getEstudanteId()).map(Usuario::getNome)
					.orElse("Estudante Não Encontrado");
			return new SolicitacaoAvaliadorResumoResponseDTO(solicitacao, estudanteNome);
		}).toList();
	}

	public SolicitacaoValidacao avaliarPorAtividade(Long solicitacaoId, Long atividadeId, String status, String justificativa) {
		return solicitacaoService.avaliarPorAtividade(solicitacaoId, atividadeId, status, justificativa);
	}

	public SolicitacaoAvaliadorDetalheResponseDTO detalharParaAvaliacao(Long solicitacaoId) {
		SolicitacaoValidacao solicitacao = solicitacaoService.detalharParaAvaliacao(solicitacaoId);
		Usuario usuario = usuarioContrato.buscarPorId(solicitacao.getEstudanteId()).orElse(null);
		String estudanteNome = usuario != null ? usuario.getNome() : "Estudante Não Encontrado";
		String estudanteEmail = usuario != null ? usuario.getEmail() : null;
		return new SolicitacaoAvaliadorDetalheResponseDTO(solicitacao, estudanteNome, estudanteEmail);
	}

	private Usuario obterEstudante(String email) {
		Usuario usuario = usuarioContrato.buscarPorEmail(email)
				.orElseThrow(() -> new AcessoNegadoAtividadeException("Estudante não encontrado"));

		if (!(usuario instanceof Estudante)) {
			throw new AcessoNegadoAtividadeException("Apenas estudantes podem acessar solicitações.");
		}
		return usuario;
	}
}
