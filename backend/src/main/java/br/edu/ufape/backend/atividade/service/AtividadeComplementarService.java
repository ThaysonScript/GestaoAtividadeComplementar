package br.edu.ufape.backend.atividade.service;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import br.edu.ufape.backend.atividade.dto.AtividadeResponseDTO;
import br.edu.ufape.backend.atividade.dto.AtualizarAtividadeRequestDTO;
import br.edu.ufape.backend.atividade.dto.CadastroAtividadeRequestDTO;
import br.edu.ufape.backend.atividade.exception.AcessoNegadoAtividadeException;
import br.edu.ufape.backend.atividade.exception.AtividadeNaoEncontradaException;
import br.edu.ufape.backend.atividade.exception.AtividadeVinculadaASolicitacaoException;
import br.edu.ufape.backend.atividade.model.AtividadeComplementar;
import br.edu.ufape.backend.atividade.model.Categoria;
import br.edu.ufape.backend.atividade.model.Natureza;
import br.edu.ufape.backend.atividade.model.ParecerConformidade;
import br.edu.ufape.backend.atividade.model.StatusAtividade;
import br.edu.ufape.backend.atividade.repository.AtividadeComplementarRepository;
import br.edu.ufape.backend.atividade.repository.ParecerConformidadeRepository;
import br.edu.ufape.backend.certificado.exception.CertificadoInvalidoException;
import br.edu.ufape.backend.certificado.model.Certificado;
import br.edu.ufape.backend.certificado.service.ArmazenamentoCertificadoService;
import br.edu.ufape.backend.solicitacao.contrato.SolicitacaoContrato;
import br.edu.ufape.backend.usuario.contrato.UsuarioContrato;
import br.edu.ufape.backend.usuario.model.Estudante;
import br.edu.ufape.backend.usuario.model.Usuario;

@Service
public class AtividadeComplementarService {

	private static final String MENSAGEM_ACESSO_NEGADO = "Apenas estudantes podem listar atividades complementares.";
	private static final String MENSAGEM_ACESSO_NEGADO_EDICAO = "Você não tem permissão para editar esta atividade.";
	private static final String MENSAGEM_ACESSO_NEGADO_EXCLUSAO = "Atividade não encontrada ou não pertence ao estudante autenticado.";
	private static final String MENSAGEM_ARQUIVO_FISICO_NAO_ENCONTRADO = "Arquivo físico do certificado não encontrado no servidor.";

	private final AtividadeComplementarRepository atividadeRepository;
	private final UsuarioContrato usuarioContrato;
	private final ArmazenamentoCertificadoService armazenamentoCertificadoService;
	private final AuditoriaConformidadeService auditoriaConformidadeService;
	private final ParecerConformidadeRepository parecerConformidadeRepository;
	private final SolicitacaoContrato solicitacaoContrato;
	private final Path diretorioCertificados;

	@Autowired
	public AtividadeComplementarService(AtividadeComplementarRepository atividadeRepository,
			UsuarioContrato usuarioContrato, ArmazenamentoCertificadoService armazenamentoCertificadoService,
			AuditoriaConformidadeService auditoriaConformidadeService,
			ParecerConformidadeRepository parecerConformidadeRepository, @Lazy SolicitacaoContrato solicitacaoContrato,
			@Value("${sgac.certificados.diretorio:certificados}") String diretorioCertificados) {
		this.atividadeRepository = atividadeRepository;
		this.usuarioContrato = usuarioContrato;
		this.armazenamentoCertificadoService = armazenamentoCertificadoService;
		this.auditoriaConformidadeService = auditoriaConformidadeService;
		this.parecerConformidadeRepository = parecerConformidadeRepository;
		this.solicitacaoContrato = solicitacaoContrato;
		String raizCertificados = diretorioCertificados != null && !diretorioCertificados.isBlank()
				? diretorioCertificados
				: "certificados";
		this.diretorioCertificados = Path.of(raizCertificados).toAbsolutePath().normalize();
	}

	public AtividadeComplementarService(AtividadeComplementarRepository atividadeRepository,
			UsuarioContrato usuarioContrato, ArmazenamentoCertificadoService armazenamentoCertificadoService,
			AuditoriaConformidadeService auditoriaConformidadeService,
			ParecerConformidadeRepository parecerConformidadeRepository, String diretorioCertificados) {
		this(atividadeRepository, usuarioContrato, armazenamentoCertificadoService, auditoriaConformidadeService,
				parecerConformidadeRepository, null, diretorioCertificados);
	}

	public ParecerConformidade auditarOuObterParecer(AtividadeComplementar atividade) {
		return auditoriaConformidadeService.auditarOuObterParecer(atividade);
	}

	public List<AtividadeComplementar> listarAtividadesDoEstudante(String emailEstudante, Natureza natureza,
			Categoria categoria) {
		Estudante estudante = obterEstudante(emailEstudante);
		return atividadeRepository.findByEstudanteComFiltros(estudante, natureza, categoria);
	}

	public List<AtividadeComplementar> listarAtividadesDoEstudante(Long estudanteId) {
		return atividadeRepository.findByEstudante_Id(estudanteId);
	}

	public Resource obterArquivoCertificado(Long id, String emailEstudante) {
		Estudante estudante = obterEstudante(emailEstudante);
		AtividadeComplementar atividade = atividadeRepository.findById(id)
				.orElseThrow(() -> new AtividadeNaoEncontradaException("Atividade não encontrada."));

		if (!atividade.getEstudante().getId().equals(estudante.getId())) {
			throw new AcessoNegadoAtividadeException(MENSAGEM_ACESSO_NEGADO_EDICAO);
		}

		Certificado certificado = atividade.getCertificado();
		if (certificado == null || certificado.getReferencia() == null) {
			throw new AtividadeNaoEncontradaException("Certificado não encontrado para esta atividade.");
		}

		try {
			Path caminho = Paths.get(certificado.getReferencia()).toAbsolutePath().normalize();
			if (!caminho.startsWith(diretorioCertificados)) {
				throw new AtividadeNaoEncontradaException(MENSAGEM_ARQUIVO_FISICO_NAO_ENCONTRADO);
			}

			Path raizReal = diretorioCertificados.toRealPath();
			Path caminhoReal = caminho.toRealPath();
			if (!caminhoReal.startsWith(raizReal)) {
				throw new AtividadeNaoEncontradaException(MENSAGEM_ARQUIVO_FISICO_NAO_ENCONTRADO);
			}

			Resource resource = new UrlResource(caminhoReal.toUri());
			if (resource.exists() && resource.isReadable()) {
				return resource;
			}
			throw new AtividadeNaoEncontradaException(MENSAGEM_ARQUIVO_FISICO_NAO_ENCONTRADO);
		} catch (MalformedURLException e) {
			throw new RuntimeException("Erro ao recuperar arquivo do certificado", e);
		} catch (IOException e) {
			throw new AtividadeNaoEncontradaException(MENSAGEM_ARQUIVO_FISICO_NAO_ENCONTRADO);
		}
	}

	@Transactional
	public AtividadeResponseDTO cadastrarAtividade(CadastroAtividadeRequestDTO request, MultipartFile arquivo,
			String emailEstudante) {
		validarTipoArquivo(arquivo);
		Usuario estudante = usuarioContrato.buscarPorEmail(emailEstudante)
				.orElseThrow(() -> new RuntimeException("Estudante não encontrado"));

		Certificado certificado = armazenamentoCertificadoService.armazenar(arquivo);
		AtividadeComplementar atividade = new AtividadeComplementar(request.titulo(), request.instituicaoResponsavel(),
				request.dataRealizacao(), request.cargaHoraria(), request.natureza(), request.categoria(), certificado,
				estudante);

		try {
			AtividadeComplementar atividadeSalva = atividadeRepository.save(atividade);
			return new AtividadeResponseDTO(atividadeSalva);
		} catch (RuntimeException e) {
			try {
				Files.deleteIfExists(Paths.get(certificado.getReferencia()));
			} catch (IOException ioException) {
				e.addSuppressed(ioException);
			}
			throw e;
		}
	}

	@Transactional
	public AtividadeResponseDTO atualizarAtividade(Long id, AtualizarAtividadeRequestDTO request,
			MultipartFile novoArquivo, String emailEstudante) {
		Estudante estudante = obterEstudante(emailEstudante);
		AtividadeComplementar atividade = atividadeRepository.findById(id)
				.orElseThrow(() -> new AtividadeNaoEncontradaException("Atividade não encontrada."));

		if (!atividade.getEstudante().getId().equals(estudante.getId())) {
			throw new AcessoNegadoAtividadeException(MENSAGEM_ACESSO_NEGADO_EDICAO);
		}

		if (solicitacaoContrato != null && solicitacaoContrato.existeSolicitacaoEmAbertoComAtividade(id)) {
			throw new AtividadeVinculadaASolicitacaoException();
		}

		atividade.setTitulo(request.titulo());
		atividade.setInstituicaoResponsavel(request.instituicaoResponsavel());
		atividade.setDataRealizacao(request.dataRealizacao());
		atividade.setCargaHorariaEmHoras(request.cargaHoraria());
		atividade.setNatureza(request.natureza());
		atividade.setCategoria(request.categoria());

		atividade.setStatus(StatusAtividade.PENDENTE);

		Certificado certificadoAntigo = atividade.getCertificado();
		Certificado novoCertificado = null;

		if (novoArquivo != null && !novoArquivo.isEmpty()) {
			validarTipoArquivo(novoArquivo);
			novoCertificado = armazenamentoCertificadoService.armazenar(novoArquivo);
			atividade.setCertificado(novoCertificado);
		}

		try {
			AtividadeComplementar atividadeSalva = atividadeRepository.save(atividade);

			parecerConformidadeRepository.findByAtividadeId(id).ifPresent(parecerConformidadeRepository::delete);

			if (novoCertificado != null && certificadoAntigo != null) {
				removerArquivoCertificado(certificadoAntigo);
			}

			return new AtividadeResponseDTO(atividadeSalva);
		} catch (RuntimeException e) {
			if (novoCertificado != null) {
				removerArquivoCertificado(novoCertificado);
			}
			throw e;
		}
	}

	@Transactional
	public void excluirAtividade(Long id, String emailEstudante) {
		Estudante estudante = obterEstudante(emailEstudante);
		AtividadeComplementar atividade = atividadeRepository.findByIdAndEstudante(id, estudante)
				.orElseThrow(() -> new AcessoNegadoAtividadeException(MENSAGEM_ACESSO_NEGADO_EXCLUSAO));

		if (solicitacaoContrato != null && solicitacaoContrato.existeSolicitacaoEmAbertoComAtividade(id)) {
			throw new AtividadeVinculadaASolicitacaoException();
		}

		parecerConformidadeRepository.findByAtividadeId(id).ifPresent(parecerConformidadeRepository::delete);
		removerArquivoCertificado(atividade.getCertificado());
		atividadeRepository.delete(atividade);
	}

	public Resource obterArquivoCertificadoSemRestricao(Long id) {
		AtividadeComplementar atividade = atividadeRepository.findById(id)
				.orElseThrow(() -> new AtividadeNaoEncontradaException("Atividade não encontrada."));

		Certificado certificado = atividade.getCertificado();
		if (certificado == null || certificado.getReferencia() == null) {
			throw new AtividadeNaoEncontradaException("Certificado não encontrado para esta atividade.");
		}

		try {
			Path caminho = Paths.get(certificado.getReferencia()).toAbsolutePath().normalize();
			if (!caminho.startsWith(diretorioCertificados)) {
				throw new AtividadeNaoEncontradaException(MENSAGEM_ARQUIVO_FISICO_NAO_ENCONTRADO);
			}

			Path raizReal = diretorioCertificados.toRealPath();
			Path caminhoReal = caminho.toRealPath();
			if (!caminhoReal.startsWith(raizReal)) {
				throw new AtividadeNaoEncontradaException(MENSAGEM_ARQUIVO_FISICO_NAO_ENCONTRADO);
			}

			Resource resource = new UrlResource(caminhoReal.toUri());
			if (resource.exists() && resource.isReadable()) {
				return resource;
			}
			throw new AtividadeNaoEncontradaException(MENSAGEM_ARQUIVO_FISICO_NAO_ENCONTRADO);
		} catch (MalformedURLException e) {
			throw new RuntimeException("Erro ao recuperar arquivo do certificado", e);
		} catch (IOException e) {
			throw new AtividadeNaoEncontradaException(MENSAGEM_ARQUIVO_FISICO_NAO_ENCONTRADO);
		}
	}

	public AtividadeComplementar buscarPorId(Long id) {
		return atividadeRepository.findById(id)
				.orElseThrow(() -> new AtividadeNaoEncontradaException("Atividade não encontrada com o id: " + id));
	}

	private void removerArquivoCertificado(Certificado certificado) {
		if (certificado == null || certificado.getReferencia() == null) {
			return;
		}
		try {
			Files.deleteIfExists(Path.of(certificado.getReferencia()));
		} catch (IOException ex) {
			throw new RuntimeException("Falha ao remover arquivo do certificado", ex);
		}
	}

	private Estudante obterEstudante(String email) {
		Usuario usuario = usuarioContrato.buscarPorEmail(email)
				.orElseThrow(() -> new AcessoNegadoAtividadeException(MENSAGEM_ACESSO_NEGADO));

		if (!(usuario instanceof Estudante estudante)) {
			throw new AcessoNegadoAtividadeException(MENSAGEM_ACESSO_NEGADO);
		}
		return estudante;
	}

	private void validarTipoArquivo(MultipartFile arquivo) {
		if (arquivo == null || arquivo.isEmpty()) {
			throw new CertificadoInvalidoException("Arquivo de certificado não pode ser vazio");
		}
		String tipo = arquivo.getContentType();
		if (tipo == null || !(tipo.equals("application/pdf") || tipo.equals("image/png") || tipo.equals("image/jpeg")
				|| tipo.equals("image/jpg"))) {
			throw new CertificadoInvalidoException("Certificado inválido. Aceitos: PDF, PNG ou JPEG");
		}
	}
}
