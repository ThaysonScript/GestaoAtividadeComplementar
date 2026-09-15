package br.edu.ufape.backend.revisao.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import br.edu.ufape.backend.revisao.dto.DadosRevisaoReenvioDTO;
import br.edu.ufape.backend.revisao.dto.DadosRevisaoReenvioDTO.ItemCorrigidoDTO;
import br.edu.ufape.backend.solicitacao.model.SolicitacaoValidacao;
import br.edu.ufape.backend.solicitacao.repository.SolicitacaoValidacaoRepository;

@Service
public class RevisaoConfirmacaoService {

    private final SolicitacaoValidacaoRepository solicitacaoRepository;

    public RevisaoConfirmacaoService(SolicitacaoValidacaoRepository solicitacaoRepository) {
        this.solicitacaoRepository = solicitacaoRepository;
    }

    public DadosRevisaoReenvioDTO listar(Long solicitacaoId) {
        Long id = solicitacaoId != null ? solicitacaoId : 1L;
        Optional<SolicitacaoValidacao> opt = solicitacaoRepository.findByIdComItens(id);
        if (opt.isPresent()) {
            SolicitacaoValidacao s = opt.get();
            List<ItemCorrigidoDTO> itensCorrigidos = s.getItens().stream()
                .map(item -> new ItemCorrigidoDTO(
                    item.getAtividadeId(),
                    item.getTitulo(),
                    item.getNatureza(),
                    item.getCargaHoraria()
                ))
                .toList();
            return new DadosRevisaoReenvioDTO(
                s.getId(),
                itensCorrigidos,
                List.of("certificado_corrigido.pdf"),
                "Reenviar com assinatura digitalizada do orientador.",
                s.getStatus().toString(),
                "SUBMETIDA",
                false,
                false
            );
        }
        return new DadosRevisaoReenvioDTO(
            id,
            List.of(new ItemCorrigidoDTO(3L, "Iniciação Científica PIBIC/CNPq", "ACC", 45)),
            List.of("certificado_corrigido.pdf"),
            "Reenviar com assinatura digitalizada do orientador.",
            "COM_PENDENCIAS",
            "SUBMETIDA",
            false,
            false
        );
    }

    public DadosRevisaoReenvioDTO confirmar(Long solicitacaoId) {
        Optional<SolicitacaoValidacao> opt = solicitacaoRepository.findByIdComItens(solicitacaoId);
        if (opt.isPresent()) {
            SolicitacaoValidacao s = opt.get();
            List<ItemCorrigidoDTO> itensCorrigidos = s.getItens().stream()
                .map(item -> new ItemCorrigidoDTO(
                    item.getAtividadeId(),
                    item.getTitulo(),
                    item.getNatureza(),
                    item.getCargaHoraria()
                ))
                .toList();
            return new DadosRevisaoReenvioDTO(
                s.getId(),
                itensCorrigidos,
                List.of("certificado_corrigido.pdf"),
                "Reenviar com assinatura digitalizada do orientador.",
                s.getStatus().toString(),
                "SUBMETIDA",
                true,
                true
            );
        }
        return new DadosRevisaoReenvioDTO(
            solicitacaoId,
            List.of(new ItemCorrigidoDTO(3L, "Iniciação Científica PIBIC/CNPq", "ACC", 45)),
            List.of("certificado_corrigido.pdf"),
            "Reenviar com assinatura digitalizada do orientador.",
            "COM_PENDENCIAS",
            "SUBMETIDA",
            true,
            true
        );
    }
}
