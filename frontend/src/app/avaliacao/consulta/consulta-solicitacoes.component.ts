import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { StatusSolicitacao } from '../../solicitacao/solicitacao.model';
import { SolicitacaoAvaliadorResumo } from '../avaliacao.model';
import { AvaliacaoService } from '../avaliacao.service';
import { classeStatus, rotuloStatus } from '../../solicitacao/status-solicitacao';
import { dataFormatada } from '../../solicitacao/solicitacao.helpers';

interface OpcaoFiltroStatus {
  valor: StatusSolicitacao | '';
  rotulo: string;
}

const OPCOES_FILTRO_STATUS: OpcaoFiltroStatus[] = [
  { valor: '', rotulo: 'Todos' },
  { valor: 'SUBMETIDA', rotulo: rotuloStatus('SUBMETIDA') },
  { valor: 'EM_ANALISE', rotulo: rotuloStatus('EM_ANALISE') },
  { valor: 'COM_PENDENCIAS', rotulo: rotuloStatus('COM_PENDENCIAS') },
  { valor: 'APROVADA', rotulo: rotuloStatus('APROVADA') },
  { valor: 'REJEITADA', rotulo: rotuloStatus('REJEITADA') },
];

@Component({
  selector: 'app-consulta-solicitacoes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './consulta-solicitacoes.component.html',
})
export class ConsultaSolicitacoesComponent implements OnInit {
  private readonly avaliacaoService = inject(AvaliacaoService);
  private readonly router = inject(Router);

  readonly opcoesFiltroStatus = OPCOES_FILTRO_STATUS;
  readonly carregando = signal(true);
  readonly mensagemErro = signal<string | null>(null);
  readonly solicitacoes = signal<SolicitacaoAvaliadorResumo[]>([]);
  readonly filtroStatus = signal<StatusSolicitacao | ''>('');
  readonly semSolicitacoes = computed<boolean>(() => this.solicitacoes().length === 0);

  ngOnInit(): void {
    this.carregarSolicitacoes();
  }

  carregarSolicitacoes(): void {
    this.carregando.set(true);
    this.mensagemErro.set(null);
    const status = this.filtroStatus() || undefined;
    this.avaliacaoService.consultar(status).subscribe({
      next: (solicitacoes) => {
        const idsParaVerificar = solicitacoes.map((s) => s.id);
        if (idsParaVerificar.length === 0) {
          this.solicitacoes.set([]);
          this.carregando.set(false);
          return;
        }
        let verificados = 0;
        const solicitacoesAtualizadas = [...solicitacoes];
        idsParaVerificar.forEach((id) => {
          this.avaliacaoService.detalhar(id).subscribe({
            next: (detalhe) => {
              verificados++;
              const todasAprovadas =
                detalhe.itens.length > 0 &&
                detalhe.itens.every((i) => (i.status ?? detalhe.status) === 'APROVADA');
              const index = solicitacoesAtualizadas.findIndex((s) => s.id === id);
              if (index >= 0 && todasAprovadas) {
                solicitacoesAtualizadas[index] = {
                  ...solicitacoesAtualizadas[index],
                  status: 'APROVADA',
                };
              }
              if (verificados === idsParaVerificar.length) {
                this.solicitacoes.set(solicitacoesAtualizadas);
                this.carregando.set(false);
              }
            },
            error: () => {
              verificados++;
              if (verificados === idsParaVerificar.length) {
                this.solicitacoes.set(solicitacoesAtualizadas);
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

  alterarFiltro(status: string): void {
    this.filtroStatus.set(status as StatusSolicitacao | '');
    this.carregarSolicitacoes();
  }

  abrirDetalhe(solicitacao: SolicitacaoAvaliadorResumo): void {
    this.router.navigate(['/avaliacao/solicitacoes', solicitacao.id]);
  }

  readonly rotuloStatus = rotuloStatus;
  readonly classeStatus = classeStatus;
  readonly dataFormatada = dataFormatada;
}
