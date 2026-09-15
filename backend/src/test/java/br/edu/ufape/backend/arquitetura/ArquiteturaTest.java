package br.edu.ufape.backend.arquitetura;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

/**
 * Testes automatizados de arquitetura e fronteiras de módulos com ArchUnit.
 *
 * Regras baseadas em
 * documentos/02-arquitetura/5-comunicacao-entre-camadas-e-modulos.rst
 *
 * Exceção consciente documentada: O acoplamento com ..usuario.model..
 * (entidades JPA como Usuario/Estudante) é permitido para mapeamento relacional
 * ORM/Hibernate, mas o acesso aos componentes internos (repository e service) é
 * estritamente proibido para módulos externos.
 */
@AnalyzeClasses(packages = "br.edu.ufape.backend", importOptions = ImportOption.DoNotIncludeTests.class)
class ArquiteturaTest {

	@ArchTest
	static final ArchRule nenhumaClasseForaDeUsuarioDeveAcessarInternosDeUsuario = noClasses().that()
			.resideOutsideOfPackage("..usuario..").should().dependOnClassesThat()
			.resideInAnyPackage("..usuario.repository..", "..usuario.service..")
			.because("O acesso ao módulo de usuários deve ocorrer exclusivamente via UsuarioContrato; "
					+ "a única exceção consciente é ..usuario.model.. por causa do mapeamento JPA");

	@ArchTest
	static final ArchRule nenhumaClasseForaDeAtividadeDeveAcessarRepositoryDeAtividade = noClasses().that()
			.resideOutsideOfPackage("..atividade..").and().haveSimpleNameNotContaining("SubstituicaoService").should()
			.dependOnClassesThat().resideInAPackage("..atividade.repository..")
			.because("O repositório de atividades é de uso exclusivo interno do módulo de atividades");

	@ArchTest
	static final ArchRule controllersNaoDevemDependerDeRepositories = noClasses().that()
			.resideInAPackage("..controller..").should().dependOnClassesThat().resideInAPackage("..repository..")
			.because("Controllers não devem acessar diretamente a camada de persistência");

	@ArchTest
	static final ArchRule controllersNaoDevemDependerDeServices = noClasses().that().resideInAPackage("..controller..")
			.should().dependOnClassesThat().resideInAPackage("..service..")
			.because("Controllers devem se comunicar com a aplicação exclusivamente através de Facades");

	@ArchTest
	static final ArchRule facadesNaoDevemDependerDeRepositories = noClasses().that().resideInAPackage("..facade..")
			.should().dependOnClassesThat().resideInAPackage("..repository..").because(
					"Facades devem orquestrar casos de uso através de Services, sem acoplamento direto com persistência");

	@ArchTest
	static final ArchRule servicesNaoDevemDependerDeControllers = noClasses().that().resideInAPackage("..service..")
			.should().dependOnClassesThat().resideInAPackage("..controller..")
			.because("Services pertencem à camada de domínio/aplicação e não devem conhecer a camada de apresentação");

	@ArchTest
	static final ArchRule controllersNaoDevemDependerDeOutrosControllers = noClasses().that()
			.resideInAPackage("..autenticacao.controller..").should().dependOnClassesThat()
			.resideInAPackage("..atividade.controller..")
			.because("Controllers não devem depender de outros controllers");

	@ArchTest
	static final ArchRule repositoriesNaoDevemDependerDeOutrosRepositories = noClasses().that()
			.resideInAPackage("..usuario.repository..").should().dependOnClassesThat()
			.resideInAPackage("..atividade.repository..").because("Repositories não devem se comunicar entre si");
}
