import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConsultaSolicitacoesComponent } from './consulta-solicitacoes.component';
import { AvaliacaoService } from '../avaliacao.service';
import { SolicitacaoAvaliadorResumo } from '../avaliacao.model';
import { StatusSolicitacao } from '../../solicitacao/solicitacao.model';

const solicitacoesMock: SolicitacaoAvaliadorResumo[] = [
  {
    id: 7,
    estudanteNome: 'Ana Souza',
    dataSubmissao: '2026-08-20T10:30:00',
    status: 'SUBMETIDA',
    totalAtividades: 2,
    cargaHorariaTotal: 35,
  },
  {
    id: 8,
    estudanteNome: 'Bruno Lima',
    dataSubmissao: '2026-07-01',
    dataAvaliacao: '2026-07-05',
    status: 'REJEITADA',
    totalAtividades: 1,
    cargaHorariaTotal: 10,
  },
];

function montar(duble: Partial<AvaliacaoService>): ComponentFixture<ConsultaSolicitacoesComponent> {
  const mock = {
    consultar: () => of([] as SolicitacaoAvaliadorResumo[]),
    detalhar: () => of({ id: 1, itens: [], status: 'SUBMETIDA' } as any),
    ...duble,
  };
  TestBed.configureTestingModule({
    imports: [ConsultaSolicitacoesComponent],
    providers: [provideRouter([]), { provide: AvaliacaoService, useValue: mock }],
  });
  return TestBed.createComponent(ConsultaSolicitacoesComponent);
}

describe('ConsultaSolicitacoesComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('lista as solicitacoes com estudante, data de submissao e status', () => {
    const fixture = montar({ consultar: () => of(solicitacoesMock) });
    fixture.detectChanges();
    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('Ana Souza');
    expect(texto).toContain('Bruno Lima');
    expect(texto).toContain('Submetida');
    expect(texto).toContain('Rejeitada');
    expect(texto).toContain('20/08/2026');
  });

  it('exibe estado de carregamento antes da resposta', () => {
    const fixture = montar({
      consultar: () => new Observable<SolicitacaoAvaliadorResumo[]>(() => {}),
    });
    fixture.detectChanges();
    expect(fixture.componentInstance.carregando()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Carregando');
  });

  it('mostra banner de erro com role alert quando a consulta falha', () => {
    const fixture = montar({
      consultar: () => throwError(() => new Error('Falha ao carregar')),
    });
    fixture.detectChanges();
    const alerta = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alerta).toBeTruthy();
    expect(alerta.textContent).toContain('Falha ao carregar');
  });

  it('mostra estado vazio quando nao ha solicitacoes', () => {
    const fixture = montar({ consultar: () => of([]) });
    fixture.detectChanges();
    expect(fixture.componentInstance.semSolicitacoes()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Nenhuma solicitação encontrada');
  });

  it('dispara nova requisicao ao backend ao trocar o filtro de status', () => {
    const statusRecebidos: (StatusSolicitacao | undefined)[] = [];
    const fixture = montar({
      consultar: (status?: StatusSolicitacao) => {
        statusRecebidos.push(status);
        return of(solicitacoesMock);
      },
    });
    fixture.detectChanges();
    fixture.componentInstance.alterarFiltro('REJEITADA');
    expect(statusRecebidos).toEqual([undefined, 'REJEITADA']);
    expect(fixture.componentInstance.filtroStatus()).toBe('REJEITADA');
  });

  it('navega para o detalhe ao clicar em uma solicitacao', () => {
    const fixture = montar({ consultar: () => of(solicitacoesMock) });
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    const navegarSpy = vi.spyOn(router, 'navigate');
    fixture.componentInstance.abrirDetalhe(solicitacoesMock[0]);
    expect(navegarSpy).toHaveBeenCalledWith(['/avaliacao/solicitacoes', 7]);
  });
});
