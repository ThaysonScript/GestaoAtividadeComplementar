import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  AtividadeComHistoricoParecer,
  TipoParecerAvaliador,
} from '../atividades/historico-parecer.model';
import { HistoricoParecerService } from '../pendencias/historico-parecer.service';

@Component({
  selector: 'app-pendencias-historico',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pendencias-historico.component.html',
})
export class PendenciasHistoricoComponent implements OnInit {
  private readonly historicoService = inject(HistoricoParecerService);
  readonly carregando = signal(true);
  readonly mensagemErro = signal<string | null>(null);
  readonly atividades = signal<AtividadeComHistoricoParecer[]>([]);

  readonly semAtividades = computed(() => this.atividades().length === 0 && !this.carregando());

  readonly temPendencias = computed(() => this.atividades().some((a) => a.pendenciasAtivas));

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando.set(true);
    this.mensagemErro.set(null);
    this.historicoService.listarPorEstudante().subscribe({
      next: (dados) => {
        this.atividades.set(dados);
        this.carregando.set(false);
      },
      error: (erro: Error) => {
        this.mensagemErro.set(erro.message);
        this.carregando.set(false);
      },
    });
  }

  classeParecer(tipo: TipoParecerAvaliador): string {
    switch (tipo) {
      case 'CORRECAO':
        return 'bg-[#ffdad6] text-[#93000a] border-[#ba1a1a]/30';
      case 'MANTIDO':
        return 'bg-[#fff8e1] text-[#7a5900] border-[#ffe082]';
      case 'PRE_APROVADO':
        return 'bg-[#e6efe9] text-[#00522e] border-[#003629]/30';
      default:
        return 'bg-[#f8f9fa] text-[#404945]';
    }
  }

  rotuloParecer(tipo: TipoParecerAvaliador): string {
    switch (tipo) {
      case 'CORRECAO':
        return 'Correção necessária';
      case 'MANTIDO':
        return 'Mantido';
      case 'PRE_APROVADO':
        return 'Pré-aprovado';
      default:
        return tipo;
    }
  }

  dataFormatada(valor: string): string {
    const partes = valor.split('T')[0].split('-');
    if (partes.length !== 3) return valor;
    const [ano, mes, dia] = partes;
    return `${dia}/${mes}/${ano}`;
  }
}
