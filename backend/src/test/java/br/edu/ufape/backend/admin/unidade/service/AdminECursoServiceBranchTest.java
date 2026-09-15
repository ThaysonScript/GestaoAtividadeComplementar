package br.edu.ufape.backend.admin.unidade.service;

import br.edu.ufape.backend.admin.dto.CadastroInstitucionalRequestDTO;
import br.edu.ufape.backend.admin.dto.UsuarioAdminResponseDTO;
import br.edu.ufape.backend.admin.service.AdminUsuarioService;
import br.edu.ufape.backend.autenticacao.exception.EmailJaCadastradoException;
import br.edu.ufape.backend.curso.dto.CursoDTO;
import br.edu.ufape.backend.curso.repository.CursoRepository;
import br.edu.ufape.backend.curso.service.CursoService;
import br.edu.ufape.backend.usuario.contrato.UsuarioContrato;
import br.edu.ufape.backend.usuario.model.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminECursoServiceBranchTest {

	@Mock
	private UsuarioContrato usuarioContrato;
	@Mock
	private PasswordEncoder passwordEncoder;
	@Mock
	private CursoRepository cursoRepository;

	@InjectMocks
	private AdminUsuarioService adminUsuarioService;

	@InjectMocks
	private CursoService cursoService;

	@Test
    @DisplayName("Branch AdminUsuarioService: Email duplicado e perfis nao permitidos")
    void deveValidarCadastroInstitucional() {
        when(usuarioContrato.existePorEmail("jaexiste@ufape.edu.br")).thenReturn(true);
        CadastroInstitucionalRequestDTO req1 = new CadastroInstitucionalRequestDTO(
                "Nome", "jaexiste@ufape.edu.br", "senha1234", Role.AVALIADOR, null, null, null, null
        );
        assertThrows(EmailJaCadastradoException.class, () -> adminUsuarioService.cadastrarUsuarioInstitucional(req1));

        when(usuarioContrato.existePorEmail("novo@ufape.edu.br")).thenReturn(false);
        CadastroInstitucionalRequestDTO reqEstudante = new CadastroInstitucionalRequestDTO(
                "Nome", "novo@ufape.edu.br", "senha1234", Role.ESTUDANTE, null, null, null, null
        );
        assertThrows(IllegalArgumentException.class, () -> adminUsuarioService.cadastrarUsuarioInstitucional(reqEstudante));
    }

	@Test
    @DisplayName("Branch AdminUsuarioService: Cadastrar Administrador com valores padrao")
    void deveCadastrarAdministradorComSucesso() {
        when(usuarioContrato.existePorEmail("admin@ufape.edu.br")).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hash");
        when(usuarioContrato.salvar(any())).thenAnswer(i -> i.getArgument(0));

        CadastroInstitucionalRequestDTO reqAdmin = new CadastroInstitucionalRequestDTO(
                "Admin", "admin@ufape.edu.br", "senha1234", Role.ADMINISTRADOR, null, null, null, null
        );
        UsuarioAdminResponseDTO res = adminUsuarioService.cadastrarUsuarioInstitucional(reqAdmin);

        assertNotNull(res);
        assertEquals(Role.ADMINISTRADOR, res.role());
    }

	@Test
    @DisplayName("Branch AdminUsuarioService: Alternar status de usuario nao encontrado")
    void deveLancarExcecaoAoAlternarStatusUsuarioInexistente() {
        when(usuarioContrato.buscarPorId(99L)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> adminUsuarioService.alternarStatusUsuario(99L));
    }

	@Test
    @DisplayName("Branch CursoService: Codigo de curso duplicado e buscas vazias/invalidas")
    void deveValidarCursoService() {
        when(cursoRepository.existsByCodigoIgnoreCase("BCC")).thenReturn(true);
        CursoDTO dto = new CursoDTO(null, "Ciencia da Computacao", "BCC", 90, 320, true);

        assertThrows(IllegalArgumentException.class, () -> cursoService.criarCurso(dto));

        assertTrue(cursoService.buscarPorNomeOuCodigo(null).isEmpty());
        assertTrue(cursoService.buscarPorNomeOuCodigo("   ").isEmpty());
    }
}
