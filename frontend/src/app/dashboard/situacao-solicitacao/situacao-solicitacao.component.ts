import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SolicitacaoService } from '../../solicitacao/solicitacao.service';
import { SolicitacaoResumo } from '../../solicitacao/solicitacao.model';

@Component({
  selector: 'app-situacao-solicitacao',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (!carregando() && !erro()) {
      <div
        class="bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-[#e1e3e4] mb-6"
      >
        @if (!solicitacaoMaisRecente()) {
          <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h3 class="text-base font-bold text-[#191c1d]">Atividades Complementares</h3>
              <p class="text-xs text-[#404945] mt-0.5">
                Você ainda não enviou nenhuma solicitação de validação.
              </p>
            </div>
            <a
              routerLink="/solicitacoes/enviar"
              class="px-4 py-2 bg-[#003629] text-white text-xs font-semibold rounded-lg hover:bg-[#1b4d3e] transition-colors"
            >
              Enviar Solicitação
            </a>
          </div>
        } @else if (
          solicitacaoMaisRecente()?.status === 'SUBMETIDA' ||
          solicitacaoMaisRecente()?.status === 'EM_ANALISE'
        ) {
          <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <span
                class="inline-block bg-[#fff8e1] text-[#b78103] border border-[#ffe082] text-[11px] px-2.5 py-0.5 rounded-full font-semibold mb-1"
              >
                {{ solicitacaoMaisRecente()?.status }}
              </span>
              <h3 class="text-base font-bold text-[#191c1d]">Solicitação em Andamento</h3>
              <p class="text-xs text-[#404945] mt-0.5">
                Submetida em: {{ solicitacaoMaisRecente()?.dataSubmissao | date: 'dd/MM/yyyy' }}
              </p>
            </div>
            <a
              routerLink="/solicitacoes"
              class="text-xs font-semibold text-[#003629] hover:underline"
            >
              Ver detalhes &rarr;
            </a>
          </div>
        } @else if (
          solicitacaoMaisRecente()?.status === 'COM_PENDENCIAS' ||
          solicitacaoMaisRecente()?.status === 'REJEITADA'
        ) {
          <div
            class="bg-[#ffdad6]/40 border-l-4 border-[#ba1a1a] p-4 rounded-r-lg flex flex-col sm:flex-row justify-between items-center gap-4"
          >
            <div>
              <span
                class="inline-block bg-[#ffdad6] text-[#93000a] text-[11px] px-2.5 py-0.5 rounded-full font-semibold mb-1"
              >
                Atenção Necessária: {{ solicitacaoMaisRecente()?.status }}
              </span>
              <h3 class="text-base font-bold text-[#93000a]">Sua solicitação requer ajustes</h3>
              <p class="text-xs text-[#404945] mt-0.5">
                Verifique as pendências apontadas pelo avaliador.
              </p>
            </div>
            <a
              routerLink="/solicitacoes"
              class="px-4 py-2 bg-[#ba1a1a] text-white text-xs font-semibold rounded-lg hover:bg-[#93000a] transition-colors"
            >
              Resolver Pendências
            </a>
          </div>
        } @else if (solicitacaoMaisRecente()?.status === 'APROVADA') {
          <div
            class="bg-[#e6efe9] border-l-4 border-[#003629] p-4 rounded-r-lg flex flex-col sm:flex-row justify-between items-center gap-4"
          >
            <div>
              <span
                class="inline-block bg-[#c3ecd2] text-[#00522e] text-[11px] px-2.5 py-0.5 rounded-full font-semibold mb-1"
              >
                Homologada: APROVADA
              </span>
              <h3 class="text-base font-bold text-[#003629]">Solicitação Aprovada</h3>
              <p class="text-xs text-[#404945] mt-0.5">
                Suas atividades complementares foram integralizadas com sucesso.
              </p>
            </div>
            <a
              routerLink="/solicitacoes"
              class="px-4 py-2 bg-[#003629] text-white text-xs font-semibold rounded-lg hover:bg-[#1b4d3e] transition-colors"
            >
              Ver Detalhes
            </a>
          </div>
        }
      </div>
    }
  `,
})
export class SituacaoSolicitacaoComponent implements OnInit {
  private readonly solicitacaoService = inject(SolicitacaoService);
  solicitacaoMaisRecente = signal<SolicitacaoResumo | null>(null);
  carregando = signal<boolean>(true);
  erro = signal<boolean>(false);

  ngOnInit(): void {
    this.solicitacaoService.listar().subscribe({
      next: (lista) => {
        if (lista && lista.length > 0) {
          const maisRecente = lista.reduce(
            (prev, current) => (prev.id > current.id ? prev : current),
            lista[0],
          );
          this.solicitacaoMaisRecente.set(maisRecente);
        } else {
          this.solicitacaoMaisRecente.set(null);
        }
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }
}
