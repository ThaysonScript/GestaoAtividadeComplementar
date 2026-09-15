import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Atividade } from '../../atividades/atividade.model';
import { AtividadeService } from '../../atividades/atividade.service';
import { SolicitacaoService } from '../solicitacao.service';
import { SolicitacaoDetalhe, SolicitacaoResumo } from '../solicitacao.model';
import { rotuloStatus } from '../status-solicitacao';

@Component({
  selector: 'app-envio-solicitacao',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './envio-solicitacao.component.html',
})
export class EnvioSolicitacaoComponent implements OnInit {
  private readonly atividadeService = inject(AtividadeService);
  private readonly solicitacaoService = inject(SolicitacaoService);

  readonly carregando = signal(true);
  readonly mensagemErro = signal<string | null>(null);
  readonly atividades = signal<Atividade[]>([]);
  readonly semAtividades = computed<boolean>(() => this.atividades().length === 0);

  readonly selecionadas = signal<Set<number>>(new Set());

  readonly solicitacaoEmAberto = signal(false);
  readonly idSolicitacaoEmAberto = signal<number | undefined>(undefined);
  readonly itensSolicitacao = signal<{ atividadeId: number; titulo: string }[] | undefined>(
    undefined,
  );

  readonly confirmacaoAberta = signal(false);
  readonly enviando = signal(false);
  readonly mensagemErroEnvio = signal<string | null>(null);
  readonly solicitacaoEnviada = signal<SolicitacaoDetalhe | null>(null);

  readonly rotuloStatus = rotuloStatus;

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando.set(true);
    this.mensagemErro.set(null);
    this.selecionadas.set(new Set());
    this.carregarAtividades();
    this.carregarSolicitacoes();
  }

  private carregarAtividades(): void {
    this.atividadeService.listar().subscribe({
      next: (lista: Atividade[]) => {
        this.atividades.set(lista);
        this.carregando.set(false);
      },
      error: (erro: Error) => {
        this.mensagemErro.set(erro.message);
        this.carregando.set(false);
      },
    });
  }

  private carregarSolicitacoes(): void {
    this.solicitacaoService.listar().subscribe({
      next: (lista: SolicitacaoResumo[]) => {
        const emAberto = lista.find((s) => s.status === 'SUBMETIDA' || s.status === 'EM_ANALISE');
        this.solicitacaoEmAberto.set(!!emAberto);
        this.idSolicitacaoEmAberto.set(emAberto ? emAberto.id : undefined);
        if (emAberto) {
          this.solicitacaoService.detalhar(emAberto.id).subscribe({
            next: (detalhe) => {
              this.itensSolicitacao.set(
                (detalhe.itens ?? []).map((i) => ({
                  atividadeId: i.atividadeId,
                  titulo: i.titulo,
                })),
              );
            },
          });
        } else {
          this.itensSolicitacao.set(undefined);
        }
      },
    });
  }

  toggleSelecao(id: number): void {
    const atual = new Set(this.selecionadas());
    if (atual.has(id)) {
      atual.delete(id);
    } else {
      atual.add(id);
    }
    this.selecionadas.set(atual);
  }

  estaAnexada(id: number): boolean {
    return !!this.itensSolicitacao()?.some((i) => i.atividadeId === id);
  }

  abrirConfirmacao(): void {
    if (this.selecionadas().size === 0) {
      this.mensagemErroEnvio.set('Selecione ao menos uma atividade para enviar.');
      return;
    }
    this.mensagemErroEnvio.set(null);
    this.confirmacaoAberta.set(true);
  }

  cancelar(): void {
    if (this.enviando()) return;
    this.confirmacaoAberta.set(false);
  }

  confirmarEnvio(): void {
    if (this.enviando()) return;
    this.enviando.set(true);
    this.mensagemErroEnvio.set(null);

    const idsSelecionados = Array.from(this.selecionadas());
    const solicitacaoId = this.solicitacaoEmAberto() ? this.idSolicitacaoEmAberto() : undefined;

    if (!solicitacaoId) {
      // Se não há solicitação em aberto, cria uma nova com a primeira atividade selecionada
      // (o backend incluirá todas disponíveis no momento da criação)
      this.solicitacaoService.submeter().subscribe({
        next: (solicitacao) => this.tratarSucesso(solicitacao),
        error: (erro: Error) => this.tratarErro(erro),
      });
    } else {
      // Se há solicitação em aberto, anexa cada atividade selecionada que ainda não esteja anexada
      const idsJaAnexados = new Set((this.itensSolicitacao() ?? []).map((i) => i.atividadeId));
      const atividadesParaAnexar = idsSelecionados.filter((id) => !idsJaAnexados.has(id));

      if (atividadesParaAnexar.length === 0) {
        this.mensagemErroEnvio.set(
          'As atividades selecionadas já estão anexadas a esta solicitação.',
        );
        this.confirmacaoAberta.set(false);
        this.enviando.set(false);
        return;
      }

      // Envia uma por vez (API aceita uma por requisição)
      this.enviarSequencial(solicitacaoId, atividadesParaAnexar, 0);
    }
  }

  private enviarSequencial(solicitacaoId: number, ids: number[], index: number): void {
    if (index >= ids.length) {
      this.carregarDados();
      this.solicitacaoEnviada.set({
        id: solicitacaoId,
        status: 'SUBMETIDA',
        dataSubmissao: new Date().toISOString(),
        totalAtividades: 0,
        itens: [],
      } as SolicitacaoDetalhe);
      this.confirmacaoAberta.set(false);
      this.enviando.set(false);
      return;
    }

    this.solicitacaoService.submeter(solicitacaoId, ids[index]).subscribe({
      next: () => this.enviarSequencial(solicitacaoId, ids, index + 1),
      error: (erro: Error) => {
        this.mensagemErroEnvio.set(erro.message);
        this.confirmacaoAberta.set(false);
        this.enviando.set(false);
      },
    });
  }

  private tratarSucesso(solicitacao: SolicitacaoDetalhe): void {
    this.solicitacaoEnviada.set(solicitacao);
    this.confirmacaoAberta.set(false);
    this.enviando.set(false);
    this.carregarSolicitacoes();
  }

  private tratarErro(erro: Error): void {
    this.mensagemErroEnvio.set(erro.message);
    this.confirmacaoAberta.set(false);
    this.enviando.set(false);
  }
}
