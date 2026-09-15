import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { RelatorioComponent } from './relatorio.component';
import { RelatorioService } from './relatorio.service';
import { RelatorioAtividades } from './relatorio.model';

const relatorioComDados: RelatorioAtividades = {
  estudanteEmail: 'estudante@ufape.edu.br',
  naturezas: [
    {
      natureza: 'ACC',
      totalHoras: 15,
      categorias: [
        {
          categoria: 'PESQUISA',
          totalHoras: 15,
          atividades: [
            {
              id: 1,
              titulo: 'Iniciacao Cientifica',
              instituicaoResponsavel: 'UFAPE',
              dataRealizacao: '2026-03-10',
              cargaHorariaEmHoras: 15,
            },
          ],
        },
      ],
    },
  ],
  totalHorasAcc: 15,
  totalHorasAcex: 0,
  totalHorasGeral: 15,
};

const relatorioVazio: RelatorioAtividades = {
  estudanteEmail: 'estudante@ufape.edu.br',
  naturezas: [],
  totalHorasAcc: 0,
  totalHorasAcex: 0,
  totalHorasGeral: 0,
};

function montar(duble: Partial<RelatorioService>): ComponentFixture<RelatorioComponent> {
  TestBed.configureTestingModule({
    imports: [RelatorioComponent],
    providers: [
      provideRouter([]),
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: RelatorioService, useValue: duble },
    ],
  });
  return TestBed.createComponent(RelatorioComponent);
}

describe('RelatorioComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('renderiza grupos e totais quando ha dados', () => {
    const fixture = montar({ obterRelatorio: () => of(relatorioComDados) });
    fixture.detectChanges();

    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('ACC');
    expect(texto).toContain('Pesquisa');
    expect(texto).toContain('Iniciacao Cientifica');
    expect(fixture.componentInstance.relatorio()?.totalHorasGeral).toBe(15);
  });

  it('mostra empty state quando nao ha atividades', () => {
    const fixture = montar({ obterRelatorio: () => of(relatorioVazio) });
    fixture.detectChanges();

    expect(fixture.componentInstance.semAtividades()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Você ainda não possui atividades');
  });

  it('mostra banner de erro com role alert quando a requisicao falha', () => {
    const fixture = montar({
      obterRelatorio: () => throwError(() => new Error('Falha ao carregar')),
    });
    fixture.detectChanges();

    const alerta = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alerta).toBeTruthy();
    expect(alerta.textContent).toContain('Falha ao carregar');
  });

  it('exibe estado de carregamento antes da resposta', () => {
    const fixture = montar({ obterRelatorio: () => new Observable<RelatorioAtividades>(() => {}) });
    fixture.detectChanges();

    expect(fixture.componentInstance.carregando()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Carregando');
  });

  it('exibe a acao de enviar para validacao quando ha atividades', () => {
    const fixture = montar({ obterRelatorio: () => of(relatorioComDados) });
    fixture.detectChanges();

    const botaoImprimir = fixture.nativeElement.querySelector('button');
    expect(botaoImprimir).toBeTruthy();
  });

  it('nao exibe a acao de enviar para validacao no empty state', () => {
    const fixture = montar({ obterRelatorio: () => of(relatorioVazio) });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-submissao-solicitacao')).toBeNull();
  });
});
