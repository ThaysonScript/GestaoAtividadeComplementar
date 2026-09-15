package br.edu.ufape.backend.atividade.unidade.service;

import br.edu.ufape.backend.atividade.config.ProgressoProperties;
import br.edu.ufape.backend.atividade.dto.ProgressoResponseDTO;
import br.edu.ufape.backend.atividade.exception.AcessoNegadoAtividadeException;
import br.edu.ufape.backend.atividade.model.AtividadeComplementar;
import br.edu.ufape.backend.atividade.model.Categoria;
import br.edu.ufape.backend.atividade.model.Natureza;
import br.edu.ufape.backend.atividade.model.StatusAtividade;
import br.edu.ufape.backend.atividade.repository.AtividadeComplementarRepository;
import br.edu.ufape.backend.atividade.service.ProgressoService;
import br.edu.ufape.backend.curso.contrato.CursoContrato;
import br.edu.ufape.backend.curso.dto.CursoDTO;
import br.edu.ufape.backend.usuario.contrato.UsuarioContrato;
import br.edu.ufape.backend.usuario.model.Administrador;
import br.edu.ufape.backend.usuario.model.Estudante;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProgressoServiceBranchTest {

	@Mock
	private UsuarioContrato usuarioContrato;
	@Mock
	private AtividadeComplementarRepository atividadeRepository;
	@Mock
	private CursoContrato cursoContrato;

	private ProgressoProperties progressoProperties;
	private ProgressoService service;

	@BeforeEach
	void setUp() {
		progressoProperties = new ProgressoProperties();
		service = new ProgressoService(usuarioContrato, atividadeRepository, progressoProperties, cursoContrato);
	}

	@Test
    @DisplayName("Branch: Acesso negado quando usuario nao existe ou nao for Estudante")
    void deveNegarAcessoParaUsuarioInvalido() {
        when(usuarioContrato.buscarPorEmail("ausente@ufape.edu.br")).thenReturn(Optional.empty());
        assertThrows(AcessoNegadoAtividadeException.class, () -> service.obterProgresso("ausente@ufape.edu.br"));

        Administrador admin = new Administrador("Admin", "admin@ufape.edu.br", "pwd", "FULL", "TI");
        when(usuarioContrato.buscarPorEmail("admin@ufape.edu.br")).thenReturn(Optional.of(admin));
        assertThrows(AcessoNegadoAtividadeException.class, () -> service.obterProgresso("admin@ufape.edu.br"));
    }

	@Test
	@DisplayName("Branch: Calcular progresso utilizando override de metas do CursoDTO quando presente")
	void deveUtilizarMetasDoCurso() {
		Estudante est = new Estudante("Lucas", "lucas@ufape.edu.br", "pwd", "123", "BCC");
		when(usuarioContrato.buscarPorEmail("lucas@ufape.edu.br")).thenReturn(Optional.of(est));

		CursoDTO cursoDto = new CursoDTO(1L, "Bacharelado em Ciencia da Computacao", "BCC", 100, 200, true);
		when(cursoContrato.buscarPorNomeOuCodigo("BCC")).thenReturn(Optional.of(cursoDto));

		AtividadeComplementar a1 = new AtividadeComplementar("A1", "UFAPE", LocalDate.now(), 40, Natureza.ACC,
				Categoria.ENSINO, null, est);
		a1.setStatus(StatusAtividade.APROVADA);

		AtividadeComplementar a2 = new AtividadeComplementar("A2", "UFAPE", LocalDate.now(), null, Natureza.ACC,
				Categoria.ENSINO, null, est);
		a2.setStatus(StatusAtividade.PENDENTE);

		when(atividadeRepository.findByEstudanteAndNatureza(est, Natureza.ACC)).thenReturn(List.of(a1, a2));

		ProgressoResponseDTO progresso = service.obterProgresso("lucas@ufape.edu.br");

		assertNotNull(progresso);
		assertEquals(100, progresso.getAcc().getHorasExigidas());
		assertEquals(200, progresso.getAcex().getHorasExigidas());
		assertEquals(40, progresso.getAcc().getHorasAcumuladas());
	}
}
