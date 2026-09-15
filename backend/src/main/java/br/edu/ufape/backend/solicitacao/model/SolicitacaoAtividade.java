package br.edu.ufape.backend.solicitacao.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "solicitacao_atividades")
public class SolicitacaoAtividade {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "atividade_id", nullable = false)
	private Long atividadeId;

	@Column(name = "titulo", nullable = false)
	private String titulo;

	@Column(name = "carga_horaria", nullable = false)
	private Integer cargaHoraria;

	// Armazenado como String (snapshot): desacoplado do enum Natureza para garantir
	// imutabilidade historica.
	// Mudancas futuras no enum nao afetam registros ja submetidos.
	@Column(name = "natureza", nullable = false)
	private String natureza;

	@Column(name = "status")
	private String status;

	@Column(name = "justificativa")
	private String justificativa;

	public SolicitacaoAtividade() {
	}

	public SolicitacaoAtividade(Long atividadeId, String titulo, Integer cargaHoraria, String natureza) {
		this.atividadeId = atividadeId;
		this.titulo = titulo;
		this.cargaHoraria = cargaHoraria;
		this.natureza = natureza;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getAtividadeId() {
		return atividadeId;
	}

	public void setAtividadeId(Long atividadeId) {
		this.atividadeId = atividadeId;
	}

	public String getTitulo() {
		return titulo;
	}

	public void setTitulo(String titulo) {
		this.titulo = titulo;
	}

	public Integer getCargaHoraria() {
		return cargaHoraria;
	}

	public void setCargaHoraria(Integer cargaHoraria) {
		this.cargaHoraria = cargaHoraria;
	}

	public String getNatureza() {
		return natureza;
	}

	public void setNatureza(String natureza) {
		this.natureza = natureza;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getJustificativa() {
		return justificativa;
	}

	public void setJustificativa(String justificativa) {
		this.justificativa = justificativa;
	}
}
