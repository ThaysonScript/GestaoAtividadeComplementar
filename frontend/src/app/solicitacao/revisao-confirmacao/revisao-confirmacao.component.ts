import { Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DadosRevisaoReenvio } from '../revisao-confirmacao.model';

@Component({
  selector: 'app-revisao-confirmacao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './revisao-confirmacao.component.html',
})
export class RevisaoConfirmacaoComponent {
  readonly dados = input.required<DadosRevisaoReenvio>();
  readonly confirmando = signal(false);
  readonly confirmado = signal(false);
  readonly bloqueado = signal(false);

  readonly modoLeitura = computed(() => this.bloqueado() || this.confirmado());

  confirmar(): void {
    this.confirmando.set(true);
    setTimeout(() => {
      this.confirmado.set(true);
      this.bloqueado.set(true);
      this.confirmando.set(false);
    }, 600);
  }

  cancelar(): void {
    this.bloqueado.set(false);
    this.confirmado.set(false);
  }
}
