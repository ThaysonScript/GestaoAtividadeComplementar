import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DadosRevisaoReenvio } from '../revisao-confirmacao.model';
import { RevisaoConfirmacaoService } from './revisao-confirmacao.service';

@Component({
  selector: 'app-revisao-confirmacao',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './revisao-confirmacao.component.html',
})
export class RevisaoConfirmacaoComponent implements OnInit {
  private readonly service = inject(RevisaoConfirmacaoService);

  readonly carregando = signal(true);
  readonly mensagemErro = signal<string | null>(null);
  readonly dados = signal<DadosRevisaoReenvio | null>(null);

  readonly confirmando = signal(false);
  readonly confirmado = signal(false);
  readonly bloqueado = signal(false);

  readonly modoLeitura = computed(() => this.bloqueado() || this.confirmado());

  ngOnInit(): void {
    this.carregarDados();
  }

  private carregarDados(): void {
    this.carregando.set(true);
    this.mensagemErro.set(null);
    this.service.listar().subscribe({
      next: (d) => {
        this.dados.set(d);
        this.carregando.set(false);
      },
      error: (err: Error) => {
        this.mensagemErro.set(err.message);
        this.carregando.set(false);
      },
    });
  }

  confirmar(): void {
    const atual = this.dados();
    if (!atual) return;
    this.confirmando.set(true);
    this.service.confirmar(atual.solicitacaoId).subscribe({
      next: (d) => {
        this.dados.set(d);
        this.confirmado.set(true);
        this.bloqueado.set(true);
        this.confirmando.set(false);
      },
      error: () => {
        this.confirmando.set(false);
      },
    });
  }

  cancelar(): void {
    this.bloqueado.set(false);
    this.confirmado.set(false);
  }
}
