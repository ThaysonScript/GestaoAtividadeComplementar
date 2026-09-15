package br.edu.ufape.backend.substituicao.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import br.edu.ufape.backend.substituicao.dto.SubstituicaoComprovanteDTO;

@Service
public class SubstituicaoService {

    public SubstituicaoComprovanteDTO substituir(Long id, MultipartFile arquivo) {
        boolean tipoValido = arquivo != null && (arquivo.getContentType() != null &&
            (arquivo.getContentType().equals("application/pdf") || arquivo.getContentType().equals("image/png") || arquivo.getContentType().equals("image/jpeg")));
        boolean tamanhoValido = arquivo != null && arquivo.getSize() <= 5 * 1024 * 1024;
        return new SubstituicaoComprovanteDTO(
            id, "Titulo", "PENDENTE", "ACC", 30, "Descricao", false,
            arquivo != null ? arquivo.getOriginalFilename() : null,
            tamanhoValido, tipoValido, false
        );
    }

    public SubstituicaoComprovanteDTO atualizarMetadados(Long id, SubstituicaoComprovanteDTO dados) {
        return dados;
    }
}
