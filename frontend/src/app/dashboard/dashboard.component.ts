import { SituacaoSolicitacaoComponent } from './situacao-solicitacao/situacao-solicitacao.component';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LoadingSpinnerComponent } from '../core/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../core/components/empty-state/empty-state.component';
import { SummaryCardComponent } from '../core/components/summary-card/summary-card.component';
import { ProgressoCargaHoraria } from '../atividades/progresso/progresso.model';
import { ProgressoService } from '../atividades/progresso/progresso.service';
import {
  ResumoModalidade,
  percentualExibido,
  calcularResumos,
  calcularSemAtividades,
} from '../atividades/progresso/progresso-shared';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SituacaoSolicitacaoComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    SummaryCardComponent,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly progressoService = inject(ProgressoService);

  readonly carregando = signal(true);
  readonly mensagemErro = signal<string | null>(null);
  readonly progresso = signal<ProgressoCargaHoraria | null>(null);

  readonly resumos = computed<ResumoModalidade[]>(() => calcularResumos(this.progresso()));

  readonly semAtividades = computed<boolean>(() => calcularSemAtividades(this.progresso()));

  ngOnInit(): void {
    this.buscarProgresso();
  }

  tentarNovamente(): void {
    this.buscarProgresso();
  }

  percentualExibido = percentualExibido;

  private buscarProgresso(): void {
    this.carregando.set(true);
    this.mensagemErro.set(null);

    this.progressoService.obterProgresso().subscribe({
      next: (progresso) => {
        this.progresso.set(progresso);
        this.carregando.set(false);
      },
      error: (erro: Error) => {
        this.mensagemErro.set(erro.message);
        this.carregando.set(false);
      },
    });
  }
}
