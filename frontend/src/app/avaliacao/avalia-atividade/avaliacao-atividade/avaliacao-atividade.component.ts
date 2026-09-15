import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AtividadeService } from '../../../atividades/atividade.service';
import { Atividade, ParecerResponseDTO } from '../../../atividades/atividade.model';
import { AvaliacaoService } from '../../avaliacao.service';
import { DecisaoAvaliacao } from '../../avaliacao.model';
import { StatusSolicitacao } from '../../../solicitacao/solicitacao.model';
import { HistoricoParecerService } from '../../../pendencias/historico-parecer.service';
import { ParecerAvaliadorHistorico } from '../../../atividades/historico-parecer.model';
import { classeStatus, rotuloStatus } from '../../../solicitacao/status-solicitacao';
import { dataFormatada } from '../../../solicitacao/solicitacao.helpers';

@Component({
  selector: 'app-avaliacao-atividade',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './avaliacao-atividade.component.html',
})
export class AvaliacaoAtividadeComponent implements OnInit {
  private readonly atividadeService = inject(AtividadeService);
  private readonly avaliacaoService = inject(AvaliacaoService);
  private readonly historicoService = inject(HistoricoParecerService);
  private readonly route = inject(ActivatedRoute);

  atividadeId = 0;
  solicitacaoId = 0;
  atividade: Atividade | null = null;
  parecer: ParecerResponseDTO | null = null;
  historico: ParecerAvaliadorHistorico[] = [];
  statusItem = signal<StatusSolicitacao | null>(null);
  justificativaItem = signal<string | null>(null);

  // Carregamento
  readonly carregando = signal(true);
  readonly mensagemErro = signal<string | null>(null);

  // Certificado
  readonly modalVisualizacaoAberto = signal(false);
  readonly urlPrevia = signal<string | null>(null);
  readonly tipoPrevia = signal<'pdf' | 'imagem'>('pdf');
  readonly tituloPrevia = signal('');
  readonly carregandoCertificado = signal(false);
  readonly erroCertificado = signal<string | null>(null);
  private urlObjetoCriada: string | null = null;

  // Decisão
  readonly modalDecisaoAberto = signal(false);
  readonly decisaoSelecionada = signal<DecisaoAvaliacao>('APROVADA');
  readonly justificativa = signal('');
  readonly enviandoDecisao = signal(false);
  readonly erroDecisao = signal<string | null>(null);
  readonly mensagemSucesso = signal<string | null>(null);

  readonly rotuloStatus = rotuloStatus;
  readonly classeStatus = classeStatus;
  readonly dataFormatada = dataFormatada;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const solIdParam = this.route.snapshot.queryParamMap.get('solicitacaoId');
    const atvIdParam = this.route.snapshot.queryParamMap.get('atividadeId');

    if (idParam) {
      this.atividadeId = Number(idParam);
    }
    if (solIdParam) {
      this.solicitacaoId = Number(solIdParam);
    } else if (atvIdParam) {
      this.atividadeId = Number(atvIdParam);
    }

    this.carregarDados();
  }

  carregarParecerEHistorico(): void {
    if (!this.atividadeId) return;
    this.atividadeService.obterParecer(this.atividadeId).subscribe({
      next: (p) => (this.parecer = p),
      error: () => (this.parecer = null),
    });
    this.historicoService.buscarPorAtividade(this.atividadeId).subscribe({
      next: (h) => (this.historico = h ?? []),
      error: () => (this.historico = []),
    });
  }

  carregarDados(): void {
    if (!this.atividadeId) {
      this.mensagemErro.set('ID da atividade não informado.');
      this.carregando.set(false);
      return;
    }
    if (!this.solicitacaoId) {
      this.mensagemErro.set('ID da solicitação não informado.');
      this.carregando.set(false);
      return;
    }

    this.carregando.set(true);
    this.mensagemErro.set(null);

    this.avaliacaoService.detalhar(this.solicitacaoId).subscribe({
      next: (sol) => {
        const item = sol.itens.find((i) => i.atividadeId === this.atividadeId);
        this.statusItem.set(item?.status ?? null);
        this.justificativaItem.set(item?.justificativa ?? null);
        this.justificativa.set(item?.justificativa ?? '');

        this.atividadeService.buscarPorId(this.atividadeId).subscribe({
          next: (a) => {
            this.atividade = a;
            this.carregarParecerEHistorico();
            this.carregando.set(false);
          },
          error: (erro: Error) => {
            this.mensagemErro.set(erro.message);
            this.carregando.set(false);
          },
        });
      },
      error: (erro: Error) => {
        this.mensagemErro.set(erro.message);
        this.carregando.set(false);
      },
    });
  }

  visualizarCertificado(): void {
    if (!this.atividadeId) return;
    this.liberarUrlObjeto();
    this.modalVisualizacaoAberto.set(true);
    this.erroCertificado.set(null);
    this.carregandoCertificado.set(true);
    this.tituloPrevia.set(`Certificado - ${this.atividade?.titulo || 'Atividade'}`);

    this.atividadeService.obterCertificado(this.atividadeId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.urlObjetoCriada = url;
        this.urlPrevia.set(url);
        this.tipoPrevia.set(blob.type.includes('image') ? 'imagem' : 'pdf');
        this.carregandoCertificado.set(false);
      },
      error: () => {
        this.carregandoCertificado.set(false);
        this.erroCertificado.set('Não foi possível carregar o arquivo do certificado no servidor.');
      },
    });
  }

  fecharModalVisualizacao(): void {
    this.modalVisualizacaoAberto.set(false);
    this.urlPrevia.set(null);
    this.erroCertificado.set(null);
    this.liberarUrlObjeto();
  }

  abrirModalDecisao(decisao: DecisaoAvaliacao): void {
    this.decisaoSelecionada.set(decisao);
    this.justificativa.set('');
    this.erroDecisao.set(null);
    this.mensagemSucesso.set(null);
    this.modalDecisaoAberto.set(true);
  }

  fecharModalDecisao(): void {
    if (this.enviandoDecisao()) return;
    this.modalDecisaoAberto.set(false);
    this.erroDecisao.set(null);
  }

  confirmarDecisao(): void {
    if (!this.solicitacaoId || this.isDecisaoInvalida()) return;
    this.enviandoDecisao.set(true);
    this.erroDecisao.set(null);
    this.mensagemSucesso.set(null);

    const decisao = this.decisaoSelecionada();
    const textoJustificativa = this.justificativa();

    this.avaliacaoService
      .avaliarPorAtividade(this.solicitacaoId, this.atividadeId, decisao, textoJustificativa)
      .subscribe({
        next: () => {
          this.enviandoDecisao.set(false);
          this.modalDecisaoAberto.set(false);
          this.mensagemSucesso.set(
            `Solicitação #${this.solicitacaoId} avaliada com sucesso (${this.rotuloStatus(decisao)}).`,
          );
          this.carregarDados();
        },
        error: (erro: Error) => {
          this.enviandoDecisao.set(false);
          this.erroDecisao.set(erro.message);
        },
      });
  }

  isJustificativaObrigatoria(): boolean {
    return (
      this.decisaoSelecionada() === 'REJEITADA' || this.decisaoSelecionada() === 'COM_PENDENCIAS'
    );
  }

  isDecisaoInvalida(): boolean {
    if (this.enviandoDecisao()) return true;
    if (this.isJustificativaObrigatoria()) {
      return !this.justificativa().trim();
    }
    return false;
  }

  private liberarUrlObjeto(): void {
    if (this.urlObjetoCriada) {
      URL.revokeObjectURL(this.urlObjetoCriada);
      this.urlObjetoCriada = null;
    }
  }
}
