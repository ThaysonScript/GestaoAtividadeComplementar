import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RelatorioAtividades } from './relatorio.model';
import { RelatorioService } from './relatorio.service';

const ROTULOS_CATEGORIA: Record<string, string> = {
  PESQUISA: 'Pesquisa',
  EXTENSAO: 'Extensão',
  ENSINO: 'Ensino',
  EVENTOS: 'Eventos',
};

@Component({
  selector: 'app-relatorio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './relatorio.component.html',
})
export class RelatorioComponent implements OnInit {
  private readonly relatorioService = inject(RelatorioService);

  readonly carregando = signal(true);
  readonly mensagemErro = signal<string | null>(null);
  readonly relatorio = signal<RelatorioAtividades | null>(null);
  readonly semAtividades = computed<boolean>(() => (this.relatorio()?.naturezas.length ?? 0) === 0);

  ngOnInit(): void {
    this.carregarRelatorio();
  }

  carregarRelatorio(): void {
    this.carregando.set(true);
    this.mensagemErro.set(null);
    // Timeout de segurança para evitar carregamento infinito
    const timeoutId = setTimeout(() => {
      if (this.carregando()) {
        this.mensagemErro.set('Tempo esgotado ao carregar o relatório. Tente novamente.');
        this.carregando.set(false);
      }
    }, 8000);
    this.relatorioService.obterRelatorio().subscribe({
      next: (relatorio) => {
        clearTimeout(timeoutId);
        this.relatorio.set(relatorio);
        this.carregando.set(false);
      },
      error: (erro: Error) => {
        clearTimeout(timeoutId);
        this.mensagemErro.set(erro.message);
        this.carregando.set(false);
      },
    });
  }

  imprimirRelatorio(): void {
    window.print();
  }

  rotuloCategoria(categoria: string): string {
    return ROTULOS_CATEGORIA[categoria] ?? categoria;
  }

  dataFormatada(dataIso: string): string {
    const partes = dataIso.split('-');
    if (partes.length !== 3) return '';
    const [ano, mes, dia] = partes;
    return `${dia}/${mes}/${ano}`;
  }
}
