import { Component, inject, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SolicitacaoDetalhe } from '../solicitacao.model';
import { SolicitacaoService } from '../solicitacao.service';
import { rotuloStatus } from '../status-solicitacao';

@Component({
  selector: 'app-submissao-solicitacao',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './submissao-solicitacao.component.html',
})
export class SubmissaoSolicitacaoComponent {
  private readonly solicitacaoService = inject(SolicitacaoService);

  @Input() atividadeId?: number;
  @Input() atividades?: { id: number }[];
  @Input() itensSolicitacao?: { atividadeId: number }[];

  readonly confirmacaoAberta = signal(false);
  readonly enviando = signal(false);
  readonly mensagemErro = signal<string | null>(null);
  readonly solicitacaoEnviada = signal<SolicitacaoDetalhe | null>(null);
  readonly solicitacaoEmAberto = signal(false);
  readonly idSolicitacaoEmAberto = signal<number | undefined>(undefined);

  abrirConfirmacao(): void {
    this.mensagemErro.set(null);
    this.confirmacaoAberta.set(true);
  }

  cancelar(): void {
    if (this.enviando()) return;
    this.confirmacaoAberta.set(false);
  }

  confirmarSubmissao(): void {
    if (this.enviando()) return;

    const solicitacaoId = this.solicitacaoEmAberto() ? this.idSolicitacaoEmAberto() : undefined;
    const idsJaAnexados = new Set((this.itensSolicitacao ?? []).map((i) => i.atividadeId));
    const atividadeParaAnexar =
      this.atividadeId ?? this.atividades?.find((a) => !idsJaAnexados.has(a.id))?.id;
    if (solicitacaoId && !atividadeParaAnexar) {
      this.mensagemErro.set('Todas as atividades já foram anexadas a esta solicitação.');
      return;
    }

    this.enviando.set(true);
    this.mensagemErro.set(null);

    this.solicitacaoService.submeter(solicitacaoId, atividadeParaAnexar).subscribe({
      next: (solicitacao) => {
        this.solicitacaoEnviada.set(solicitacao);
        this.confirmacaoAberta.set(false);
        this.enviando.set(false);
        this.solicitacaoService.listar().subscribe({
          next: (lista) => {
            const emAberto = lista.find(
              (s) => s.status === 'SUBMETIDA' || s.status === 'EM_ANALISE',
            );
            this.solicitacaoEmAberto.set(!!emAberto);
            this.idSolicitacaoEmAberto.set(emAberto ? emAberto.id : undefined);
          },
        });
      },
      error: (erro: Error) => {
        this.mensagemErro.set(erro.message);
        this.confirmacaoAberta.set(false);
        this.enviando.set(false);
      },
    });
  }

  readonly rotuloStatus = rotuloStatus;

  ngOnInit(): void {
    this.solicitacaoService.listar().subscribe({
      next: (lista) => {
        const emAberto = lista.find((s) => s.status === 'SUBMETIDA' || s.status === 'EM_ANALISE');
        this.solicitacaoEmAberto.set(!!emAberto);
        this.idSolicitacaoEmAberto.set(emAberto ? emAberto.id : undefined);
      },
      error: () => {
        this.solicitacaoEmAberto.set(false);
        this.idSolicitacaoEmAberto.set(undefined);
      },
    });
  }
}
