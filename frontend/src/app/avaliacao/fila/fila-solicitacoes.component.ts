import { Component, OnInit, OnDestroy, computed, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  DecisaoAvaliacao,
  SolicitacaoDetalheAvaliacao,
  SolicitacaoFilaItem,
} from '../avaliacao.model';
import { AvaliacaoService } from '../avaliacao.service';
import { classeStatus, rotuloStatus } from '../../solicitacao/status-solicitacao';
import { StatusSolicitacao } from '../../solicitacao/solicitacao.model';
import { dataFormatada } from '../../solicitacao/solicitacao.helpers';

@Component({
  selector: 'app-fila-solicitacoes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './fila-solicitacoes.component.html',
})
export class FilaSolicitacoesComponent implements OnInit, OnDestroy {
  private readonly avaliacaoService = inject(AvaliacaoService);
  private readonly subscription = new Subscription();

  readonly carregando = signal(true);
  readonly mensagemErro = signal<string | null>(null);
  readonly mensagemSucesso = signal<string | null>(null);
  readonly solicitacoes = signal<SolicitacaoFilaItem[]>([]);
  readonly semSolicitacoes = computed(() => this.solicitacoes().length === 0);

  // Detalhe inline / expansão de itens
  readonly solicitacaoExpandidaId = signal<number | null>(null);
  readonly detalheExpandido = signal<SolicitacaoDetalheAvaliacao | null>(null);
  readonly carregandoDetalhe = signal(false);
  readonly erroDetalhe = signal<string | null>(null);

  // Modal de Decisão
  readonly modalDecisaoAberto = signal(false);
  readonly solicitacaoSelecionada = signal<SolicitacaoFilaItem | null>(null);
  readonly decisaoSelecionada = signal<DecisaoAvaliacao>('APROVADA');
  readonly justificativa = signal('');
  readonly enviandoDecisao = signal(false);
  readonly erroDecisao = signal<string | null>(null);

  readonly filtroStatus = signal<StatusSolicitacao | ''>('');
  readonly filtroItens = signal<StatusSolicitacao | ''>('');

  readonly isJustificativaObrigatoria = computed(
    () =>
      this.decisaoSelecionada() === 'REJEITADA' || this.decisaoSelecionada() === 'COM_PENDENCIAS',
  );

  readonly isDecisaoInvalida = computed(() => {
    if (this.enviandoDecisao()) return true;
    if (this.isJustificativaObrigatoria()) {
      return !this.justificativa().trim();
    }
    return false;
  });

  ngOnInit(): void {
    this.carregarFila();
    this.subscription.add(
      this.avaliacaoService.onAvaliacaoRealizada.subscribe(() => {
        this.carregarFila();
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  carregarFila(status?: StatusSolicitacao): void {
    this.filtroStatus.set((status as StatusSolicitacao | '') ?? '');
    this.solicitacaoExpandidaId.set(null);
    this.detalheExpandido.set(null);
    this.carregando.set(true);
    this.mensagemErro.set(null);
    this.avaliacaoService.consultar(status).subscribe({
      next: (lista) => {
        // Filtra solicitaões onde todas as atividades estão aprovadas
        const idsParaVerificar = lista.map((s) => s.id);
        if (idsParaVerificar.length === 0) {
          this.solicitacoes.set([]);
          this.carregando.set(false);
          return;
        }
        let verificados = 0;
        const solicitacoesFiltradas: SolicitacaoFilaItem[] = [];
        idsParaVerificar.forEach((id) => {
          this.avaliacaoService.detalhar(id).subscribe({
            next: (detalhe) => {
              verificados++;
              const todasAprovadas =
                detalhe.itens.length > 0 &&
                detalhe.itens.every((i) => (i.status ?? detalhe.status) === 'APROVADA');
              if (!todasAprovadas) {
                const solicitacao = lista.find((s) => s.id === id);
                if (solicitacao) solicitacoesFiltradas.push(solicitacao);
              }
              if (verificados === idsParaVerificar.length) {
                this.solicitacoes.set(solicitacoesFiltradas);
                this.carregando.set(false);
              }
            },
            error: () => {
              verificados++;
              const solicitacao = lista.find((s) => s.id === id);
              if (solicitacao) solicitacoesFiltradas.push(solicitacao);
              if (verificados === idsParaVerificar.length) {
                this.solicitacoes.set(solicitacoesFiltradas);
                this.carregando.set(false);
              }
            },
          });
        });
      },
      error: (erro: Error) => {
        this.mensagemErro.set(erro.message);
        this.carregando.set(false);
      },
    });
  }

  alternarDetalhes(solicitacao: SolicitacaoFilaItem): void {
    if (this.solicitacaoExpandidaId() === solicitacao.id) {
      this.solicitacaoExpandidaId.set(null);
      this.detalheExpandido.set(null);
      this.erroDetalhe.set(null);
      return;
    }

    this.solicitacaoExpandidaId.set(solicitacao.id);
    this.detalheExpandido.set(null);
    this.erroDetalhe.set(null);
    this.carregandoDetalhe.set(true);

    this.avaliacaoService.detalhar(solicitacao.id).subscribe({
      next: (detalhe) => {
        this.detalheExpandido.set(detalhe);
        this.carregandoDetalhe.set(false);
      },
      error: (erro: Error) => {
        this.erroDetalhe.set(erro.message);
        this.carregandoDetalhe.set(false);
      },
    });
  }

  abrirModalDecisao(
    solicitacao: SolicitacaoFilaItem,
    decisaoPadrao: DecisaoAvaliacao = 'APROVADA',
  ): void {
    this.solicitacaoSelecionada.set(solicitacao);
    this.decisaoSelecionada.set(decisaoPadrao);
    this.justificativa.set('');
    this.erroDecisao.set(null);
    this.modalDecisaoAberto.set(true);
  }

  fecharModalDecisao(): void {
    if (this.enviandoDecisao()) return;
    this.modalDecisaoAberto.set(false);
    this.solicitacaoSelecionada.set(null);
    this.erroDecisao.set(null);
  }

  confirmarDecisao(): void {
    const solicitacao = this.solicitacaoSelecionada();
    if (!solicitacao || this.isDecisaoInvalida()) return;

    this.enviandoDecisao.set(true);
    this.erroDecisao.set(null);
    this.mensagemSucesso.set(null);

    const decisao = this.decisaoSelecionada();
    const textoJustificativa = this.justificativa();

    this.avaliacaoService.avaliar(solicitacao.id, decisao, textoJustificativa).subscribe({
      next: () => {
        this.solicitacoes.update((lista) => lista.filter((item) => item.id !== solicitacao.id));
        if (this.solicitacaoExpandidaId() === solicitacao.id) {
          this.solicitacaoExpandidaId.set(null);
          this.detalheExpandido.set(null);
        }
        this.enviandoDecisao.set(false);
        this.modalDecisaoAberto.set(false);
        this.mensagemSucesso.set(
          `Solicitação #${solicitacao.id} de ${solicitacao.estudanteNome} avaliada com sucesso (${rotuloStatus(
            decisao,
          )}).`,
        );
      },
      error: (erro: Error) => {
        this.enviandoDecisao.set(false);
        this.erroDecisao.set(erro.message);
        if (erro.message.includes('já foi avaliada') || erro.message.includes('alterado')) {
          this.carregarFila();
        }
      },
    });
  }

  readonly rotuloStatus = rotuloStatus;
  readonly classeStatus = classeStatus;
  readonly dataFormatada = dataFormatada;

  filtraItemPorStatus(
    item: { status?: string; atividadeId: number },
    solicitacaoStatus: string,
  ): boolean {
    const filtro = this.filtroItens();
    if (!filtro) return true;
    const statusItem = item.status ?? solicitacaoStatus ?? '';
    return statusItem === filtro;
  }
}
