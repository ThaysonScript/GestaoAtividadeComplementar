import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FilaSolicitacoesComponent } from './fila-solicitacoes.component';
import { AvaliacaoService } from '../avaliacao.service';
import { SolicitacaoDetalheAvaliacao, SolicitacaoFilaItem } from '../avaliacao.model';

const filaMock: SolicitacaoFilaItem[] = [
  {
    id: 10,
    estudanteNome: 'Carlos Eduardo',
    dataSubmissao: '2026-08-25T10:00:00',
    status: 'SUBMETIDA',
    totalAtividades: 2,
    cargaHorariaTotal: 40,
  },
  {
    id: 11,
    estudanteNome: 'Juliana Ferreira',
    dataSubmissao: '2026-08-26T14:30:00',
    status: 'SUBMETIDA',
    totalAtividades: 1,
    cargaHorariaTotal: 20,
  },
];

const detalheMock: SolicitacaoDetalheAvaliacao = {
  id: 10,
  estudanteNome: 'Carlos Eduardo',
  estudanteEmail: 'carlos.eduardo@ufape.edu.br',
  status: 'SUBMETIDA',
  dataSubmissao: '2026-08-25T10:00:00',
  cargaHorariaTotal: 30,
  itens: [
    { atividadeId: 1, titulo: 'Monitoria de Banco de Dados', cargaHoraria: 30, natureza: 'ACC' },
  ],
};

function montar(duble: Partial<AvaliacaoService>): ComponentFixture<FilaSolicitacoesComponent> {
  const mock = {
    consultar: () => of([] as SolicitacaoFilaItem[]),
    detalhar: () => of({ itens: [] } as any),
    avaliar: () => of({}),
    onAvaliacaoRealizada: new BehaviorSubject<void>(undefined).asObservable(),
    ...duble,
  };
  TestBed.configureTestingModule({
    imports: [FilaSolicitacoesComponent],
    providers: [provideRouter([]), { provide: AvaliacaoService, useValue: mock }],
    schemas: [NO_ERRORS_SCHEMA],
  });
  return TestBed.createComponent(FilaSolicitacoesComponent);
}

describe('FilaSolicitacoesComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('deve listar itens da fila de solicitacoes', () => {
    const fixture = montar({ consultar: () => of(filaMock) });
    fixture.detectChanges();

    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('Carlos Eduardo');
    expect(texto).toContain('Juliana Ferreira');
    expect(texto).toContain('40h totais');
    expect(fixture.componentInstance.solicitacoes()).toHaveLength(2);
  });

  it('deve exibir carregamento inicial', () => {
    const fixture = montar({
      consultar: () => new Observable<SolicitacaoFilaItem[]>(() => {}),
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.carregando()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Carregando fila de solicitações');
  });

  it('deve exibir estado vazio quando nao ha solicitacoes pendentes', () => {
    const fixture = montar({ consultar: () => of([]) });
    fixture.detectChanges();

    expect(fixture.componentInstance.semSolicitacoes()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Fila de solicitações zerada!');
  });

  it('deve exibir mensagem de erro acessivel role="alert" em caso de falha', () => {
    const fixture = montar({
      consultar: () => throwError(() => new Error('Falha ao carregar fila.')),
    });
    fixture.detectChanges();

    const alerta = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alerta).toBeTruthy();
    expect(alerta.textContent).toContain('Falha ao carregar fila.');
  });

  it('deve expandir e carregar detalhes das atividades submetidas', () => {
    const fixture = montar({
      consultar: () => of(filaMock),
      detalhar: () => of(detalheMock),
    });
    fixture.detectChanges();

    fixture.componentInstance.alternarDetalhes(filaMock[0]);
    fixture.detectChanges();

    expect(fixture.componentInstance.solicitacaoExpandidaId()).toBe(10);
    expect(fixture.nativeElement.textContent).toContain('Monitoria de Banco de Dados');
  });

  it('deve abrir modal de decisao e bloquear confirmacao quando justificativa for obrigatoria e vazia', () => {
    const fixture = montar({
      consultar: () => of(filaMock),
    });
    fixture.detectChanges();

    fixture.componentInstance.abrirModalDecisao(filaMock[0], 'REJEITADA');
    fixture.detectChanges();

    expect(fixture.componentInstance.modalDecisaoAberto()).toBe(true);
    expect(fixture.componentInstance.isJustificativaObrigatoria()).toBe(true);
    expect(fixture.componentInstance.isDecisaoInvalida()).toBe(true);

    const btnConfirmar = fixture.nativeElement.querySelector(
      '[data-testid="btn-confirmar-decisao"]',
    ) as HTMLButtonElement;
    expect(btnConfirmar.disabled).toBe(true);
  });

  it('deve habilitar confirmacao ao preencher justificativa para REJEITADA', () => {
    const fixture = montar({
      consultar: () => of(filaMock),
    });
    fixture.detectChanges();

    fixture.componentInstance.abrirModalDecisao(filaMock[0], 'REJEITADA');
    fixture.componentInstance.justificativa.set('Documento em desacordo com as normas.');
    fixture.detectChanges();

    expect(fixture.componentInstance.isDecisaoInvalida()).toBe(false);
  });

  it('deve aprovar solicitacao, fechar modal e remover item da fila em memoria', () => {
    const spyAvaliar = vi.fn().mockReturnValue(of(detalheMock));
    const fixture = montar({
      consultar: () => of(filaMock),
      avaliar: spyAvaliar,
    });
    fixture.detectChanges();

    fixture.componentInstance.abrirModalDecisao(filaMock[0], 'APROVADA');
    fixture.componentInstance.confirmarDecisao();
    fixture.detectChanges();

    expect(spyAvaliar).toHaveBeenCalledWith(10, 'APROVADA', '');
    expect(fixture.componentInstance.solicitacoes().map((s) => s.id)).toEqual([11]);
    expect(fixture.componentInstance.modalDecisaoAberto()).toBe(false);
    expect(fixture.componentInstance.mensagemSucesso()).toContain('avaliada com sucesso');
  });

  it('deve recarregar a fila ao receber erro 409 de concorrencia na avaliacao', () => {
    let recarregou = false;
    const fixture = montar({
      consultar: () => {
        recarregou = true;
        return of([filaMock[1]]);
      },
      avaliar: () =>
        throwError(
          () =>
            new Error(
              'Esta solicitação já foi avaliada ou seu status foi alterado por outro usuário.',
            ),
        ),
    });
    fixture.detectChanges();

    fixture.componentInstance.abrirModalDecisao(filaMock[0], 'APROVADA');
    fixture.componentInstance.confirmarDecisao();
    fixture.detectChanges();

    expect(fixture.componentInstance.erroDecisao()).toContain('já foi avaliada');
    expect(recarregou).toBe(true);
  });
});
