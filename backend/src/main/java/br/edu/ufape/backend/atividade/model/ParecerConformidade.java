package br.edu.ufape.backend.atividade.model;

import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Entity
@Table(name = "parecer_conformidade")
public class ParecerConformidade {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "atividade_id", nullable = false)
	@OnDelete(action = OnDeleteAction.CASCADE)
	private AtividadeComplementar atividade;

	@Column(nullable = false, length = 50)
	private String naturezaSugerida; // ACC ou ACEX

	@Column(nullable = false, length = 50)
	private String categoriaSugerida; // ENSINO, PESQUISA, EXTENSAO, EVENTOS

	@Column(nullable = false)
	private Integer cargaHorariaAproveitavel;

	@Column(nullable = false, length = 100)
	private String artigoRegulamento;

	@Column(columnDefinition = "TEXT", nullable = false)
	private String justificativaTecnica;

	@Column(nullable = false)
	private Double scoreConfianca;

	@Column(nullable = false)
	private Long tempoProcessamentoMs;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private DecisaoIA decisaoIA;

	@Enumerated(EnumType.STRING)
	private DecisaoAvaliador decisaoFinalAvaliador;

	private Boolean avaliadorConcordouComIA;
	private LocalDateTime dataAnaliseIA = LocalDateTime.now(ZoneId.of("America/Recife"));

	public enum DecisaoIA {
		DEFERIDO, INDEFERIDO, AMBIGUO
	}

	public enum DecisaoAvaliador {
		DEFERIDO, INDEFERIDO
	}

	public ParecerConformidade() {
		// Construtor padrão obrigatório para instanciação via reflexão pela
		// JPA/Hibernate
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public AtividadeComplementar getAtividade() {
		return atividade;
	}

	public void setAtividade(AtividadeComplementar atividade) {
		this.atividade = atividade;
	}

	public String getNaturezaSugerida() {
		return naturezaSugerida;
	}

	public void setNaturezaSugerida(String naturezaSugerida) {
		this.naturezaSugerida = naturezaSugerida;
	}

	public String getCategoriaSugerida() {
		return categoriaSugerida;
	}

	public void setCategoriaSugerida(String categoriaSugerida) {
		this.categoriaSugerida = categoriaSugerida;
	}

	public Integer getCargaHorariaAproveitavel() {
		return cargaHorariaAproveitavel;
	}

	public void setCargaHorariaAproveitavel(Integer cargaHorariaAproveitavel) {
		this.cargaHorariaAproveitavel = cargaHorariaAproveitavel;
	}

	public String getArtigoRegulamento() {
		return artigoRegulamento;
	}

	public void setArtigoRegulamento(String artigoRegulamento) {
		this.artigoRegulamento = artigoRegulamento;
	}

	public String getJustificativaTecnica() {
		return justificativaTecnica;
	}

	public void setJustificativaTecnica(String justificativaTecnica) {
		this.justificativaTecnica = justificativaTecnica;
	}

	public Double getScoreConfianca() {
		return scoreConfianca;
	}

	public void setScoreConfianca(Double scoreConfianca) {
		this.scoreConfianca = scoreConfianca;
	}

	public Long getTempoProcessamentoMs() {
		return tempoProcessamentoMs;
	}

	public void setTempoProcessamentoMs(Long tempoProcessamentoMs) {
		this.tempoProcessamentoMs = tempoProcessamentoMs;
	}

	public DecisaoIA getDecisaoIA() {
		return decisaoIA;
	}

	public void setDecisaoIA(DecisaoIA decisaoIA) {
		this.decisaoIA = decisaoIA;
	}

	public DecisaoAvaliador getDecisaoFinalAvaliador() {
		return decisaoFinalAvaliador;
	}

	public void setDecisaoFinalAvaliador(DecisaoAvaliador decisaoFinalAvaliador) {
		this.decisaoFinalAvaliador = decisaoFinalAvaliador;
	}

	public Boolean getAvaliadorConcordouComIA() {
		return avaliadorConcordouComIA;
	}

	public void setAvaliadorConcordouComIA(Boolean avaliadorConcordouComIA) {
		this.avaliadorConcordouComIA = avaliadorConcordouComIA;
	}

	public LocalDateTime getDataAnaliseIA() {
		return dataAnaliseIA;
	}

	public void setDataAnaliseIA(LocalDateTime dataAnaliseIA) {
		this.dataAnaliseIA = dataAnaliseIA;
	}
}
