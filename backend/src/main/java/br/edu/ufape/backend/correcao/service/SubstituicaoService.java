package br.edu.ufape.backend.correcao.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import br.edu.ufape.backend.atividade.repository.AtividadeComplementarRepository;
import br.edu.ufape.backend.correcao.dto.SubstituicaoComprovanteDTO;

@Service
public class SubstituicaoService {

	private final AtividadeComplementarRepository atividadeRepository;

	public SubstituicaoService(AtividadeComplementarRepository atividadeRepository) {
		this.atividadeRepository = atividadeRepository;
	}

	public SubstituicaoComprovanteDTO substituir(Long id, MultipartFile arquivo) {
		boolean tipoValido = arquivo != null && (arquivo.getContentType() != null
				&& (arquivo.getContentType().equals("application/pdf") || arquivo.getContentType().equals("image/png")
						|| arquivo.getContentType().equals("image/jpeg")));
		boolean tamanhoValido = arquivo != null && arquivo.getSize() <= 5 * 1024 * 1024;
		return new SubstituicaoComprovanteDTO(id, "Titulo", "PENDENTE", "ACC", 30, "Descricao", false,
				arquivo != null ? arquivo.getOriginalFilename() : null, tamanhoValido, tipoValido, false);
	}

	public SubstituicaoComprovanteDTO atualizarMetadados(SubstituicaoComprovanteDTO dados) {
		if (dados.atividadeId() != null) {
			atividadeRepository.findById(dados.atividadeId()).ifPresent(atv -> {
				atv.setTitulo(dados.titulo());
				atv.setCargaHorariaEmHoras(dados.cargaHoraria());
				atividadeRepository.save(atv);
			});
		}
		return dados;
	}
}
