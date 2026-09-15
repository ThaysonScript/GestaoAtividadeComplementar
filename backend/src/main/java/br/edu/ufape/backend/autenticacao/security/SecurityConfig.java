package br.edu.ufape.backend.autenticacao.security;

import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import br.edu.ufape.backend.comum.exception.ErroResponse;
import jakarta.servlet.DispatcherType;
import jakarta.servlet.http.HttpServletResponse;
import tools.jackson.databind.ObjectMapper;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	private static final String ROLE_ADMIN = "ADMINISTRADOR";
	private static final String ROLE_AVALIADOR = "AVALIADOR";
	private static final String ROLE_ESTUDANTE = "ESTUDANTE";
	private static final String ROTA_ATIVIDADES_WILDCARD = "/api/v1/atividades/**";

	private final JwtAuthenticationFilter jwtAuthenticationFilter;
	private final Environment env;
	private final ObjectMapper objectMapper;
	private final List<String> corsAllowedOrigins;

	public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, Environment env, ObjectMapper objectMapper,
			@Value("${app.cors.allowed-origins}") List<String> corsAllowedOrigins) {
		this.jwtAuthenticationFilter = jwtAuthenticationFilter;
		this.env = env;
		this.objectMapper = objectMapper;
		this.corsAllowedOrigins = corsAllowedOrigins;
	}

	@Bean
	@SuppressWarnings("java:S4502")
	public SecurityFilterChain securityFilterChain(HttpSecurity http) {
		http.csrf(csrf -> csrf.disable()).cors(Customizer.withDefaults())
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(auth -> {
					auth.dispatcherTypeMatchers(DispatcherType.ERROR).permitAll();
					auth.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll();
					auth.requestMatchers("/api/v1/auth/cadastro", "/api/v1/auth/login", "/api/v1/auth/logout",
							"/api/v1/health", "/api/v1/health/database").permitAll();

					if (env.acceptsProfiles(Profiles.of("dev"))) {
						auth.requestMatchers("/h2-console/**").permitAll();
					}

					auth.requestMatchers(HttpMethod.POST, "/api/v1/atividades/*/avaliar").hasAnyRole(ROLE_AVALIADOR,
							ROLE_ADMIN);
					auth.requestMatchers("/api/v1/regulamentos", "/api/v1/regulamentos/**").hasAnyRole(ROLE_ADMIN,
							ROLE_AVALIADOR);
					auth.requestMatchers("/api/v1/metricas-pesquisa", "/api/v1/metricas-pesquisa/**")
							.hasAnyRole(ROLE_ADMIN, ROLE_AVALIADOR);

					auth.requestMatchers(HttpMethod.POST, "/api/v1/atividades/extrair-certificado")
							.hasRole(ROLE_ESTUDANTE);
					auth.requestMatchers(HttpMethod.POST, "/api/v1/atividades", ROTA_ATIVIDADES_WILDCARD)
							.hasRole(ROLE_ESTUDANTE);
					auth.requestMatchers(HttpMethod.PUT, ROTA_ATIVIDADES_WILDCARD).hasRole(ROLE_ESTUDANTE);
					auth.requestMatchers(HttpMethod.DELETE, ROTA_ATIVIDADES_WILDCARD).hasRole(ROLE_ESTUDANTE);
					auth.requestMatchers(HttpMethod.GET, "/api/v1/atividades/{id:[0-9]+}").hasAnyRole(ROLE_ESTUDANTE,
							ROLE_AVALIADOR, ROLE_ADMIN);
					auth.requestMatchers(HttpMethod.GET, "/api/v1/atividades/*/certificado").hasAnyRole(ROLE_ESTUDANTE,
							ROLE_AVALIADOR, ROLE_ADMIN);
					auth.requestMatchers(HttpMethod.GET, "/api/v1/atividades", ROTA_ATIVIDADES_WILDCARD,
							"/api/v1/atividades/progresso").hasRole(ROLE_ESTUDANTE);
					auth.requestMatchers(HttpMethod.GET, "/api/v1/relatorios", "/api/v1/relatorios/**")
							.hasRole(ROLE_ESTUDANTE);

					auth.requestMatchers(HttpMethod.PATCH, "/api/v1/solicitacoes/*/avaliacao").hasRole(ROLE_AVALIADOR);
					auth.requestMatchers(HttpMethod.POST, "/api/v1/solicitacoes").hasRole(ROLE_ESTUDANTE);
					auth.requestMatchers(HttpMethod.GET, "/api/v1/solicitacoes", "/api/v1/solicitacoes/{id:[0-9]+}")
							.hasRole(ROLE_ESTUDANTE);
					auth.requestMatchers(HttpMethod.GET, "/api/v1/solicitacoes/avaliacao",
							"/api/v1/solicitacoes/*/avaliacao").hasRole(ROLE_AVALIADOR);
					auth.requestMatchers("/api/v1/admin/**").hasRole(ROLE_ADMIN);

					auth.anyRequest().authenticated();
				}).exceptionHandling(exception -> exception.authenticationEntryPoint(customAuthenticationEntryPoint()))
				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
				.httpBasic(AbstractHttpConfigurer::disable);

		if (env.acceptsProfiles(Profiles.of("dev"))) {
			http.headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin));
		}

		return http.build();
	}

	@Bean
	public AuthenticationEntryPoint customAuthenticationEntryPoint() {
		return (request, response, authException) -> {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			response.setContentType(MediaType.APPLICATION_JSON_VALUE);
			response.setCharacterEncoding(StandardCharsets.UTF_8.name());
			ErroResponse erro = new ErroResponse("Acesso não autorizado. Faça login novamente.",
					HttpStatus.UNAUTHORIZED.value());
			objectMapper.writeValue(response.getWriter(), erro);
		};
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(corsAllowedOrigins);
		configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		configuration
				.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"));
		configuration.setExposedHeaders(List.of("Authorization", "Content-Disposition"));
		configuration.setAllowCredentials(true);
		configuration.setMaxAge(3600L);
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}
}
