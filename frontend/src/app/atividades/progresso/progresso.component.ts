import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProgressoCargaHoraria } from './progresso.model';
import { ProgressoService } from './progresso.service';
import { ProgressoCardComponent } from './progresso-card.component';
import { LoadingSpinnerComponent } from '../../core/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../core/components/empty-state/empty-state.component';
import { ResumoModalidade, calcularResumos, calcularSemAtividades } from './progresso-shared';

@Component({
  selector: 'app-progresso',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ProgressoCardComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  templateUrl: './progresso.component.html',
})
export class ProgressoComponent implements OnInit {
  private readonly progressoService = inject(ProgressoService);

  readonly carregando = signal(true);
  readonly mensagemErro = signal<string | null>(null);
  readonly progresso = signal<ProgressoCargaHoraria | null>(null);

  readonly cards = computed<ResumoModalidade[]>(() => calcularResumos(this.progresso()));

  readonly semAtividades = computed<boolean>(() => calcularSemAtividades(this.progresso()));

  ngOnInit(): void {
    this.buscarProgresso();
  }

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
