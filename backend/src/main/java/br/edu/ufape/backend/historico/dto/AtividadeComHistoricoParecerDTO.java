package br.edu.ufape.backend.historico.dto;

import java.util.List;

public record AtividadeComHistoricoParecerDTO(Long atividadeId, String titulo, String natureza, String categoria,
		Integer cargaHorariaEmHoras, String statusAtual, Boolean pendenciasAtivas,
		List<ParecerAvaliadorHistoricoDTO> pareceres) {
}
