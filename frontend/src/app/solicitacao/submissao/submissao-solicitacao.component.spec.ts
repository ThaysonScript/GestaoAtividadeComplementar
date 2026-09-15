import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { SubmissaoSolicitacaoComponent } from './submissao-solicitacao.component';
import { SolicitacaoService } from '../solicitacao.service';
import { SolicitacaoDetalhe } from '../solicitacao.model';

const enviadaMock: SolicitacaoDetalhe = {
  id: 7,
  status: 'SUBMETIDA',
  dataSubmissao: '2026-08-20T10:30:00',
  totalAtividades: 2,
  itens: [],
};

function montar(
  duble: Partial<SolicitacaoService>,
): ComponentFixture<SubmissaoSolicitacaoComponent> {
  const mock = {
    listar: () => of([]),
    submeter: () => of(enviadaMock),
    ...duble,
  };
  TestBed.configureTestingModule({
    imports: [SubmissaoSolicitacaoComponent],
    providers: [provideRouter([]), { provide: SolicitacaoService, useValue: mock }],
  });
  return TestBed.createComponent(SubmissaoSolicitacaoComponent);
}

describe('SubmissaoSolicitacaoComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('nao submete sem confirmacao explicita', () => {
    let chamou = false;
    const fixture = montar({
      submeter: () => {
        chamou = true;
        return of(enviadaMock);
      },
    });
    fixture.detectChanges();

    const botaoAbrir = fixture.nativeElement.querySelector(
      '[data-testid="abrir-submissao"]',
    ) as HTMLButtonElement;
    botaoAbrir.click();
    fixture.detectChanges();

    expect(chamou).toBe(false);
    const dialogo = fixture.nativeElement.querySelector('dialog');
    expect(dialogo).toBeTruthy();
    expect(dialogo.getAttribute('aria-modal')).toBe('true');
  });

  it('exibe confirmacao com o status SUBMETIDA apos sucesso', () => {
    const fixture = montar({ submeter: () => of(enviadaMock) });
    fixture.detectChanges();

    const botaoAbrir = fixture.nativeElement.querySelector(
      '[data-testid="abrir-submissao"]',
    ) as HTMLButtonElement;
    botaoAbrir.click();
    fixture.detectChanges();
    const botaoConfirmar = fixture.nativeElement.querySelector(
      '[data-testid="confirmar-submissao"]',
    ) as HTMLButtonElement;
    botaoConfirmar.click();
    fixture.detectChanges();

    const sucesso = fixture.nativeElement.querySelector('[data-testid="banner-submissao-sucesso"]');
    expect(sucesso).toBeTruthy();
    expect(sucesso.textContent).toContain('Submetida');
    expect(fixture.componentInstance.confirmacaoAberta()).toBe(false);
  });

  it('mantem estado de envio e desabilita o botao durante a chamada', () => {
    const fixture = montar({ submeter: () => new Observable<SolicitacaoDetalhe>(() => {}) });
    fixture.detectChanges();

    const botaoAbrir = fixture.nativeElement.querySelector(
      '[data-testid="abrir-submissao"]',
    ) as HTMLButtonElement;
    botaoAbrir.click();
    fixture.detectChanges();
    const botaoConfirmar = fixture.nativeElement.querySelector(
      '[data-testid="confirmar-submissao"]',
    ) as HTMLButtonElement;
    botaoConfirmar.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.enviando()).toBe(true);
    const botaoConfirmarAtual = fixture.nativeElement.querySelector(
      '[data-testid="confirmar-submissao"]',
    ) as HTMLButtonElement;
    expect(botaoConfirmarAtual.disabled).toBe(true);
  });

  it('nao dispara duas submissoes simultaneas', () => {
    let chamadas = 0;
    const fixture = montar({
      submeter: () => {
        chamadas += 1;
        return new Observable<SolicitacaoDetalhe>(() => {});
      },
    });
    fixture.detectChanges();

    const botaoAbrir = fixture.nativeElement.querySelector(
      '[data-testid="abrir-submissao"]',
    ) as HTMLButtonElement;
    botaoAbrir.click();
    fixture.detectChanges();
    const botaoConfirmar = fixture.nativeElement.querySelector(
      '[data-testid="confirmar-submissao"]',
    ) as HTMLButtonElement;
    botaoConfirmar.click();
    fixture.detectChanges();
    botaoConfirmar.click();

    expect(chamadas).toBe(1);
  });

  it('exibe mensagem de conflito 409 sem quebrar a tela', () => {
    const fixture = montar({
      submeter: () =>
        throwError(
          () =>
            new Error(
              'Você já possui uma solicitação em aberto. Acompanhe o andamento antes de enviar outra.',
            ),
        ),
    });
    fixture.detectChanges();

    const botaoAbrir = fixture.nativeElement.querySelector(
      '[data-testid="abrir-submissao"]',
    ) as HTMLButtonElement;
    botaoAbrir.click();
    fixture.detectChanges();
    const botaoConfirmar = fixture.nativeElement.querySelector(
      '[data-testid="confirmar-submissao"]',
    ) as HTMLButtonElement;
    botaoConfirmar.click();
    fixture.detectChanges();

    const alerta = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alerta.textContent).toContain('já possui uma solicitação em aberto');
    expect(fixture.componentInstance.enviando()).toBe(false);
  });

  it('tenta inserir nova atividade a solicitacao em aberto e passa se funcionar', () => {
    let argumentos: (number | undefined)[] = [];
    const fixture = montar({
      submeter: (sid?: number, aid?: number) => {
        argumentos = [sid, aid];
        return of({
          ...enviadaMock,
          id: 8,
          itens: [{ atividadeId: 3, titulo: 'Teste', cargaHoraria: 10, natureza: 'EXTENSAO' }],
        });
      },
      listar: () => of([enviadaMock]),
    });
    fixture.componentInstance.solicitacaoEmAberto.set(true);
    fixture.componentInstance.idSolicitacaoEmAberto.set(8);
    fixture.componentInstance.atividadeId = 3;
    fixture.detectChanges();

    fixture.componentInstance.idSolicitacaoEmAberto.set(8);
    fixture.componentInstance.abrirConfirmacao();
    fixture.detectChanges();

    const botaoConfirmar = fixture.nativeElement.querySelector(
      '[data-testid="confirmar-submissao"]',
    ) as HTMLButtonElement;
    botaoConfirmar.click();
    fixture.detectChanges();

    expect(argumentos[0]).toBe(8);
    expect(argumentos[1]).toBe(3);
  });

  it('anexa atividade a solicitacao em aberto quando atividadeId e passado', () => {
    let argumentos: (number | undefined)[] = [];
    const fixture = montar({
      listar: () => of([{ ...enviadaMock, id: 8, status: 'SUBMETIDA' }]),
      submeter: (sid?: number, aid?: number) => {
        argumentos = [sid, aid];
        return of({ ...enviadaMock, id: 8 });
      },
    });
    fixture.componentInstance.solicitacaoEmAberto.set(true);
    fixture.componentInstance.idSolicitacaoEmAberto.set(8);
    fixture.componentInstance.atividadeId = 3;
    fixture.componentInstance.abrirConfirmacao();
    fixture.detectChanges();

    const botaoConfirmar = fixture.nativeElement.querySelector(
      '[data-testid="confirmar-submissao"]',
    ) as HTMLButtonElement;
    botaoConfirmar.click();
    fixture.detectChanges();

    expect(argumentos[0]).toBe(8);
    expect(argumentos[1]).toBe(3);
  });

  it('bloqueia anexacao sem atividadeId quando ha solicitacao em aberto', () => {
    const fixture = montar({ submeter: () => of(enviadaMock) });
    fixture.componentInstance.solicitacaoEmAberto.set(true);
    fixture.componentInstance.idSolicitacaoEmAberto.set(8);
    fixture.componentInstance.atividadeId = 3;
    fixture.componentInstance.abrirConfirmacao();
    fixture.detectChanges();

    const botaoConfirmar = fixture.nativeElement.querySelector(
      '[data-testid="confirmar-submissao"]',
    ) as HTMLButtonElement;
    botaoConfirmar.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.enviando()).toBe(false);
  });

  it('exibe mensagem distinta quando nao ha atividades', () => {
    const fixture = montar({
      submeter: () =>
        throwError(
          () =>
            new Error(
              'Cadastre ao menos uma atividade antes de enviar o relatório para validação.',
            ),
        ),
    });
    fixture.detectChanges();

    const botaoAbrir = fixture.nativeElement.querySelector(
      '[data-testid="abrir-submissao"]',
    ) as HTMLButtonElement;
    botaoAbrir.click();
    fixture.detectChanges();
    const botaoConfirmar = fixture.nativeElement.querySelector(
      '[data-testid="confirmar-submissao"]',
    ) as HTMLButtonElement;
    botaoConfirmar.click();
    fixture.detectChanges();

    const alerta = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alerta.textContent).toContain('Cadastre ao menos uma atividade');
  });
});
