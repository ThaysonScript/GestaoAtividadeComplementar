import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { DetalheAvaliacaoComponent } from './detalhe-avaliacao.component';
import { AvaliacaoService } from '../avaliacao.service';
import { SolicitacaoAvaliadorDetalhe } from '../avaliacao.model';

const detalheMock: SolicitacaoAvaliadorDetalhe = {
  id: 7,
  estudanteNome: 'Ana Souza',
  estudanteEmail: 'ana.souza@ufape.edu.br',
  dataSubmissao: '2026-08-20T10:30:00',
  dataAvaliacao: '2026-08-22T09:00:00',
  status: 'REJEITADA',
  justificativa: 'Certificado ilegível.',
  cargaHorariaTotal: 35,
  itens: [
    { atividadeId: 1, titulo: 'Iniciacao Cientifica', cargaHoraria: 15, natureza: 'ACC' },
    { atividadeId: 2, titulo: 'Projeto de Extensao', cargaHoraria: 20, natureza: 'ACEX' },
  ],
};

function montar(
  duble: Partial<AvaliacaoService>,
  id = '7',
): ComponentFixture<DetalheAvaliacaoComponent> {
  TestBed.configureTestingModule({
    imports: [DetalheAvaliacaoComponent],
    providers: [
      provideRouter([]),
      { provide: AvaliacaoService, useValue: duble },
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            paramMap: {
              get: (chave: string) => (chave === 'id' ? id : null),
            },
          },
        },
      },
    ],
  });
  return TestBed.createComponent(DetalheAvaliacaoComponent);
}

describe('DetalheAvaliacaoComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('exibe estado de carregamento antes da resposta', () => {
    const fixture = montar({
      detalhar: () => new Observable<SolicitacaoAvaliadorDetalhe>(() => {}),
    });
    fixture.detectChanges();
    expect(fixture.componentInstance.carregando()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Carregando');
  });

  it('renderiza o detalhe completo da solicitacao', () => {
    const fixture = montar({ detalhar: () => of(detalheMock) });
    fixture.detectChanges();
    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('Ana Souza');
    expect(texto).toContain('Rejeitada');
  });

  it('mostra banner de erro amigavel para id inexistente', () => {
    const fixture = montar(
      { detalhar: () => throwError(() => new Error('Solicitação não encontrada.')) },
      '999',
    );
    fixture.detectChanges();
    const alerta = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alerta).toBeTruthy();
    expect(alerta.textContent).toContain('Solicitação não encontrada.');
  });
});
