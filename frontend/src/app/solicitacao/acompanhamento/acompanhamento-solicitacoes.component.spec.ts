import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, Subject, throwError } from 'rxjs';
import { AcompanhamentoSolicitacoesComponent } from './acompanhamento-solicitacoes.component';
import { SolicitacaoService } from '../solicitacao.service';
import { SolicitacaoDetalhe, SolicitacaoResumo } from '../solicitacao.model';

const solicitacoesMock: SolicitacaoResumo[] = [
  { id: 7, status: 'SUBMETIDA', dataSubmissao: '2026-08-20T10:30:00', totalAtividades: 2 },
  {
    id: 8,
    status: 'REJEITADA',
    dataSubmissao: '2026-07-01',
    dataAvaliacao: '2026-07-05',
    totalAtividades: 1,
  },
];

const detalheMock: SolicitacaoDetalhe = {
  id: 8,
  status: 'REJEITADA',
  dataSubmissao: '2026-07-01',
  dataAvaliacao: '2026-07-05',
  totalAtividades: 1,
  justificativa: 'Certificado ilegível.',
  itens: [{ atividadeId: 3, titulo: 'Monitoria', cargaHoraria: 30, natureza: 'ACC' }],
};

function montar(
  duble: Partial<SolicitacaoService>,
): ComponentFixture<AcompanhamentoSolicitacoesComponent> {
  TestBed.configureTestingModule({
    imports: [AcompanhamentoSolicitacoesComponent],
    providers: [provideRouter([]), { provide: SolicitacaoService, useValue: duble }],
  });
  return TestBed.createComponent(AcompanhamentoSolicitacoesComponent);
}

describe('AcompanhamentoSolicitacoesComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('lista as solicitacoes com status e data de submissao', () => {
    const fixture = montar({ listar: () => of(solicitacoesMock) });
    fixture.detectChanges();

    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('Submetida');
    expect(texto).toContain('Rejeitada');
    expect(texto).toContain('20/08/2026');
    expect(texto).toContain('01/07/2026');
  });

  it('exibe rotulo textual para os cinco estados', () => {
    const fixture = montar({ listar: () => of([]) });
    const componente = fixture.componentInstance;

    expect(componente.rotuloStatus('SUBMETIDA')).toBe('Submetida');
    expect(componente.rotuloStatus('EM_ANALISE')).toBe('Em análise');
    expect(componente.rotuloStatus('COM_PENDENCIAS')).toBe('Com pendências');
    expect(componente.rotuloStatus('APROVADA')).toBe('Aprovada');
    expect(componente.rotuloStatus('REJEITADA')).toBe('Rejeitada');
  });

  it('mostra empty state com atalho para o relatorio quando nao ha solicitacoes', () => {
    const fixture = montar({ listar: () => of([]) });
    fixture.detectChanges();

    expect(fixture.componentInstance.semSolicitacoes()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain(
      'Você ainda não submeteu nenhuma solicitação',
    );
    const atalho = fixture.nativeElement.querySelector('a[href="/solicitacoes/enviar"]');
    expect(atalho).toBeTruthy();
  });

  it('mostra banner de erro com role alert quando a listagem falha', () => {
    const fixture = montar({ listar: () => throwError(() => new Error('Falha ao carregar')) });
    fixture.detectChanges();

    const alerta = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alerta).toBeTruthy();
    expect(alerta.textContent).toContain('Falha ao carregar');
  });

  it('exibe estado de carregamento antes da resposta', () => {
    const fixture = montar({ listar: () => new Observable<SolicitacaoResumo[]>(() => {}) });
    fixture.detectChanges();

    expect(fixture.componentInstance.carregando()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Carregando');
  });

  it('carrega e exibe o detalhe da solicitacao selecionada', () => {
    const fixture = montar({ listar: () => of(solicitacoesMock), detalhar: () => of(detalheMock) });
    fixture.detectChanges();

    fixture.componentInstance.selecionar(solicitacoesMock[1]);
    fixture.detectChanges();

    expect(fixture.componentInstance.detalheSelecionado()).toEqual(detalheMock);
    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('Monitoria');
    expect(texto).toContain('Certificado ilegível.');
  });

  it('ignora resposta atrasada de solicitacao que nao esta mais selecionada', () => {
    const primeiraResposta = new Subject<SolicitacaoDetalhe>();
    const segundaResposta = new Subject<SolicitacaoDetalhe>();
    const detalheAntigo: SolicitacaoDetalhe = {
      ...detalheMock,
      id: 7,
      status: 'SUBMETIDA',
      justificativa: undefined,
      itens: [],
    };

    const fixture = montar({
      listar: () => of(solicitacoesMock),
      detalhar: (id: number) => (id === 7 ? primeiraResposta : segundaResposta).asObservable(),
    });
    fixture.detectChanges();

    fixture.componentInstance.selecionar(solicitacoesMock[0]);
    fixture.componentInstance.selecionar(solicitacoesMock[1]);
    segundaResposta.next(detalheMock);
    primeiraResposta.next(detalheAntigo);

    expect(fixture.componentInstance.idSelecionado()).toBe(8);
    expect(fixture.componentInstance.detalheSelecionado()).toEqual(detalheMock);
    expect(fixture.componentInstance.carregandoDetalhe()).toBe(false);
  });

  it('ignora resposta atrasada de requisicao anterior para a mesma solicitacao', () => {
    const primeiraResposta = new Subject<SolicitacaoDetalhe>();
    const segundaResposta = new Subject<SolicitacaoDetalhe>();
    const detalheAntigo: SolicitacaoDetalhe = {
      ...detalheMock,
      justificativa: 'Resposta antiga',
    };

    const fixture = montar({
      listar: () => of(solicitacoesMock),
      detalhar: (() => {
        const respostas = [primeiraResposta, segundaResposta];
        return () =>
          respostas.shift()?.asObservable() ?? throwError(() => new Error('Chamada inesperada'));
      })(),
    });
    fixture.detectChanges();

    fixture.componentInstance.selecionar(solicitacoesMock[1]);
    fixture.componentInstance.selecionar(solicitacoesMock[1]);
    segundaResposta.next(detalheMock);
    primeiraResposta.next(detalheAntigo);

    expect(fixture.componentInstance.idSelecionado()).toBe(8);
    expect(fixture.componentInstance.detalheSelecionado()).toEqual(detalheMock);
    expect(fixture.componentInstance.carregandoDetalhe()).toBe(false);
  });

  it('ignora erro atrasado de solicitacao que nao esta mais selecionada', () => {
    const primeiraResposta = new Subject<SolicitacaoDetalhe>();
    const segundaResposta = new Subject<SolicitacaoDetalhe>();
    const fixture = montar({
      listar: () => of(solicitacoesMock),
      detalhar: (id: number) => (id === 7 ? primeiraResposta : segundaResposta).asObservable(),
    });
    fixture.detectChanges();

    fixture.componentInstance.selecionar(solicitacoesMock[0]);
    fixture.componentInstance.selecionar(solicitacoesMock[1]);
    segundaResposta.next(detalheMock);
    primeiraResposta.error(new Error('Erro antigo'));

    expect(fixture.componentInstance.idSelecionado()).toBe(8);
    expect(fixture.componentInstance.detalheSelecionado()).toEqual(detalheMock);
    expect(fixture.componentInstance.erroDetalhe()).toBeNull();
    expect(fixture.componentInstance.carregandoDetalhe()).toBe(false);
  });

  it('limpa carregamento do detalhe ao fechar a visualizacao', () => {
    const fixture = montar({
      listar: () => of(solicitacoesMock),
      detalhar: () => new Observable<SolicitacaoDetalhe>(() => {}),
    });
    fixture.detectChanges();

    fixture.componentInstance.selecionar(solicitacoesMock[0]);
    expect(fixture.componentInstance.carregandoDetalhe()).toBe(true);

    fixture.componentInstance.fecharDetalhe();

    expect(fixture.componentInstance.idSelecionado()).toBeNull();
    expect(fixture.componentInstance.detalheSelecionado()).toBeNull();
    expect(fixture.componentInstance.erroDetalhe()).toBeNull();
    expect(fixture.componentInstance.carregandoDetalhe()).toBe(false);
  });

  it('exibe erro do detalhe sem derrubar a lista', () => {
    const fixture = montar({
      listar: () => of(solicitacoesMock),
      detalhar: () => throwError(() => new Error('Solicitação não encontrada.')),
    });
    fixture.detectChanges();

    fixture.componentInstance.selecionar(solicitacoesMock[0]);
    fixture.detectChanges();

    expect(fixture.componentInstance.erroDetalhe()).toBe('Solicitação não encontrada.');
    expect(fixture.componentInstance.solicitacoes().length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Solicitação não encontrada.');
  });

  it('mostra carregamento do detalhe enquanto a resposta nao chega', () => {
    const fixture = montar({
      listar: () => of(solicitacoesMock),
      detalhar: () => new Observable<SolicitacaoDetalhe>(() => {}),
    });
    fixture.detectChanges();

    fixture.componentInstance.selecionar(solicitacoesMock[0]);
    fixture.detectChanges();

    expect(fixture.componentInstance.carregandoDetalhe()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Carregando detalhes');
  });
});
