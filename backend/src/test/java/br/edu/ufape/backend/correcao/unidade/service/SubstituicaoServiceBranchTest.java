package br.edu.ufape.backend.correcao.unidade.service;

import br.edu.ufape.backend.atividade.repository.AtividadeComplementarRepository;
import br.edu.ufape.backend.correcao.dto.SubstituicaoComprovanteDTO;
import br.edu.ufape.backend.correcao.service.SubstituicaoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class SubstituicaoServiceBranchTest {

	private SubstituicaoService service;

	@BeforeEach
	void setUp() {
		AtividadeComplementarRepository repo = mock(AtividadeComplementarRepository.class);
		service = new SubstituicaoService(repo);
	}

	@Test
	@DisplayName("Branch: Arquivo nulo deve resultar em validacoes falsas e nome nulo")
	void deveTratarArquivoNulo() {
		SubstituicaoComprovanteDTO dto = service.substituir(1L, null);

		assertNotNull(dto);
		assertFalse(dto.validacaoTipo());
		assertFalse(dto.validacaoTamanho());
		assertNull(dto.novoComprovante());
	}

	@Test
	@DisplayName("Branch: Arquivo com ContentType nulo e tipo invalido")
	void deveTratarContentTypeNuloEInvalido() {
		MockMultipartFile fileContentTypeNull = new MockMultipartFile("arquivo", "teste.bin", null, new byte[10]);
		SubstituicaoComprovanteDTO dto1 = service.substituir(1L, fileContentTypeNull);
		assertFalse(dto1.validacaoTipo());

		MockMultipartFile fileInvalido = new MockMultipartFile("arquivo", "doc.txt", "text/plain", new byte[10]);
		SubstituicaoComprovanteDTO dto2 = service.substituir(1L, fileInvalido);
		assertFalse(dto2.validacaoTipo());
	}

	@Test
	@DisplayName("Branch: Tipos aceitos (PDF, PNG, JPEG) e tamanho no limite")
	void deveValidarTiposAceitosETamanhoValido() {
		MockMultipartFile pdf = new MockMultipartFile("arquivo", "cert.pdf", "application/pdf", new byte[1024]);
		MockMultipartFile png = new MockMultipartFile("arquivo", "cert.png", "image/png", new byte[1024]);
		MockMultipartFile jpeg = new MockMultipartFile("arquivo", "cert.jpg", "image/jpeg", new byte[1024]);

		assertTrue(service.substituir(1L, pdf).validacaoTipo());
		assertTrue(service.substituir(1L, png).validacaoTipo());
		assertTrue(service.substituir(1L, jpeg).validacaoTipo());
	}

	@Test
	@DisplayName("Branch: Arquivo acima do limite de 5MB deve invalidar tamanho")
	void deveInvalidarArquivoAcimaDe5MB() {
		byte[] conteudoGrande = new byte[5 * 1024 * 1024 + 1];
		MockMultipartFile grande = new MockMultipartFile("arquivo", "grande.pdf", "application/pdf", conteudoGrande);

		SubstituicaoComprovanteDTO dto = service.substituir(1L, grande);
		assertFalse(dto.validacaoTamanho());
		assertTrue(dto.validacaoTipo());
	}

	@Test
	@DisplayName("Branch: Atualizacao de metadados deve retornar o próprio DTO enviado")
	void deveAtualizarMetadados() {
		SubstituicaoComprovanteDTO input = new SubstituicaoComprovanteDTO(1L, "Titulo", "PENDENTE", "ACC", 30, "Desc",
				false, "arq.pdf", true, true, false);
		assertEquals(input, service.atualizarMetadados(input));
	}
}
