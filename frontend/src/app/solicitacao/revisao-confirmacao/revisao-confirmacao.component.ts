import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
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
  private readonly route = inject(ActivatedRoute);

  readonly carregando = signal(true);
  readonly mensagemErro = signal<string | null>(null);
  readonly dados = signal<DadosRevisaoReenvio | null>(null);

  readonly confirmando = signal(false);
  readonly confirmado = signal(false);
  readonly bloqueado = signal(false);

  readonly temRevisao = computed(() => {
    const d = this.dados();
    return !!(d && (d.itensCorrigidos?.length ?? 0) > 0);
  });

  readonly modoLeitura = computed(() => this.bloqueado() || this.confirmado());

  readonly solicitacaoId = signal<number | null>(null);

  obterCamposAlterados(id: number): string[] {
    try {
      const raw = localStorage.getItem(`sgac_revisao_campos_${id}`);
      if (raw) return JSON.parse(raw) as string[];
    } catch {
      // ignore
    }
    return [];
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('solicitacaoId');
    if (idParam) {
      this.solicitacaoId.set(Number(idParam));
    }
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando.set(true);
    this.mensagemErro.set(null);
    this.service.listar(this.solicitacaoId() ?? undefined).subscribe({
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
        // Limpa os campos alterados após confirmar o reenvio
        if (d?.itensCorrigidos && typeof localStorage !== 'undefined' && localStorage) {
          for (const item of d.itensCorrigidos) {
            const id = item?.atividadeId;
            if (id != null && localStorage) {
              localStorage.removeItem(`sgac_revisao_campos_${id}`);
            }
          }
        }
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
