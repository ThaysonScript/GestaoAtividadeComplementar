package br.edu.ufape.backend.admin.service;

import br.edu.ufape.backend.admin.dto.CadastroInstitucionalRequestDTO;
import br.edu.ufape.backend.autenticacao.exception.EmailJaCadastradoException;
import br.edu.ufape.backend.usuario.contrato.UsuarioContrato;
import br.edu.ufape.backend.usuario.model.Administrador;
import br.edu.ufape.backend.usuario.model.Avaliador;
import br.edu.ufape.backend.usuario.model.Role;
import br.edu.ufape.backend.usuario.model.Usuario;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminUsuarioServiceTest {

	@Mock
	private UsuarioContrato usuarioContrato;

	@Mock
	private PasswordEncoder passwordEncoder;

	@InjectMocks
	private AdminUsuarioService service;

	@Test
	@DisplayName("deve cadastrar avaliador")
	void deveCadastrarAvaliador() {
		when(usuarioContrato.existePorEmail(anyString())).thenReturn(false);
		when(passwordEncoder.encode(anyString())).thenReturn("hash");
		when(usuarioContrato.salvar(any(Avaliador.class))).thenAnswer(i -> i.getArgument(0));

		CadastroInstitucionalRequestDTO req = new CadastroInstitucionalRequestDTO("Nome", "teste@ufape.edu.br", "senha",
			Role.AVALIADOR, "registro", "area", null, null);
		assertNotNull(service.cadastrarUsuarioInstitucional(req));
	}

	@Test
	@DisplayName("deve cadastrar administrador")
	void deveCadastrarAdministrador() {
		when(usuarioContrato.existePorEmail(anyString())).thenReturn(false);
		when(passwordEncoder.encode(anyString())).thenReturn("hash");
		when(usuarioContrato.salvar(any(Administrador.class))).thenAnswer(i -> i.getArgument(0));

		CadastroInstitucionalRequestDTO req = new CadastroInstitucionalRequestDTO("Admin", "admin@ufape.edu.br", "senha",
			Role.ADMINISTRADOR, null, null, "TOTAL", "Coordenação Geral");
		assertNotNull(service.cadastrarUsuarioInstitucional(req));
	}

	@Test
	@DisplayName("deve lancar excecao quando email existe")
	void deveLancarExcecaoQuandoEmailExiste() {
		when(usuarioContrato.existePorEmail(anyString())).thenReturn(true);
		CadastroInstitucionalRequestDTO req = new CadastroInstitucionalRequestDTO("Nome", "teste@ufape.edu.br", "senha",
			Role.AVALIADOR, "registro", "area", null, null);
		assertThrows(EmailJaCadastradoException.class, () -> service.cadastrarUsuarioInstitucional(req));
	}

	@Test
	@DisplayName("deve listar usuarios")
	void deveListarUsuarios() {
		when(usuarioContrato.listarTodos()).thenReturn(Collections.emptyList());
		assertTrue(service.listarUsuarios(null, null).isEmpty());
	}

	@Test
	@DisplayName("deve alternar status")
	void deveAlternarStatus() {
		Usuario usuario = new Avaliador("Nome", "teste@ufape.edu.br", "hash", "REG-1", "area");
		usuario.setIsActive(true);
		when(usuarioContrato.buscarPorId(1L)).thenReturn(Optional.of(usuario));
		when(usuarioContrato.salvar(any(Usuario.class))).thenAnswer(i -> i.getArgument(0));

		assertNotNull(service.alternarStatusUsuario(1L));
	}
}
