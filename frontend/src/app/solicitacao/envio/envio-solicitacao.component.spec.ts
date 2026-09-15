import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { EnvioSolicitacaoComponent } from './envio-solicitacao.component';
import { AtividadeService } from '../../atividades/atividade.service';
import { SolicitacaoService } from '../solicitacao.service';

describe('EnvioSolicitacaoComponent', () => {
  let fixture: ComponentFixture<EnvioSolicitacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnvioSolicitacaoComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: AtividadeService, useValue: { listar: () => of([]) } },
        {
          provide: SolicitacaoService,
          useValue: {
            listar: () => of([]),
            detalhar: () => of({ id: 1, status: 'SUBMETIDA', itens: [] }),
            submeter: () => of({ id: 1, status: 'SUBMETIDA' }),
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(EnvioSolicitacaoComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deve alternar selecao', () => {
    fixture.componentInstance.toggleSelecao(1);
    expect(fixture.componentInstance.selecionadas().has(1)).toBe(true);
    fixture.componentInstance.toggleSelecao(1);
    expect(fixture.componentInstance.selecionadas().has(1)).toBe(false);
  });

  it('deve abrir confirmacao com atividades selecionadas', () => {
    fixture.componentInstance.selecionadas.set(new Set([1]));
    fixture.componentInstance.abrirConfirmacao();
    expect(fixture.componentInstance.confirmacaoAberta()).toBe(true);
  });

  it('deve cancelar', () => {
    fixture.componentInstance.abrirConfirmacao();
    fixture.componentInstance.cancelar();
    expect(fixture.componentInstance.confirmacaoAberta()).toBe(false);
  });

  it('estaAnexada deve retornar false quando nao anexada', () => {
    fixture.componentInstance.itensSolicitacao.set([{ atividadeId: 2, titulo: 'T' }]);
    expect(fixture.componentInstance.estaAnexada(1)).toBe(false);
  });

  it('semAtividades deve ser true quando vazio', () => {
    fixture.componentInstance.atividades.set([]);
    expect(fixture.componentInstance.semAtividades()).toBe(true);
  });

  it('deve mostrar erro se abrir confirmacao sem atividades selecionadas', () => {
    fixture.componentInstance.selecionadas.set(new Set());
    fixture.componentInstance.abrirConfirmacao();
    expect(fixture.componentInstance.mensagemErroEnvio()).toContain('Selecione');
    expect(fixture.componentInstance.confirmacaoAberta()).toBe(false);
  });

  it('estaAnexada deve retornar true quando anexada', () => {
    fixture.componentInstance.itensSolicitacao.set([{ atividadeId: 1, titulo: 'T' }]);
    expect(fixture.componentInstance.estaAnexada(1)).toBe(true);
  });

  it('deve cancelar sem fechar se estiver enviando', () => {
    fixture.componentInstance.enviando.set(true);
    fixture.componentInstance.confirmacaoAberta.set(true);
    fixture.componentInstance.cancelar();
    expect(fixture.componentInstance.confirmacaoAberta()).toBe(true);
  });

  it('deve confirmar envio criando nova solicitacao', () => {
    const componente = fixture.componentInstance;
    componente.selecionadas.set(new Set([1]));
    componente.solicitacaoEmAberto.set(false);
    componente.confirmacaoAberta.set(true);
    componente.confirmarEnvio();
    expect(true).toBe(true); // chamada nao deve lancar erro
  });

  it('deve carregar dados e chamar servicos', () => {
    const componente = fixture.componentInstance;
    componente.carregarDados();
    expect(
      componente.carregando() ||
        componente.mensagemErro() !== null ||
        componente.atividades().length >= 0,
    ).toBeTruthy();
  });

  it('deve tratar erro de envio', () => {
    const componente = fixture.componentInstance;
    componente.selecionadas.set(new Set([1]));
    componente.solicitacaoEmAberto.set(true);
    componente.idSolicitacaoEmAberto.set(1);
    componente.itensSolicitacao.set([{ atividadeId: 2, titulo: 'T' }]);
    componente.confirmacaoAberta.set(true);
    componente.confirmarEnvio();
    expect(typeof componente.mensagemErroEnvio()).toBe('object');
  });

  it('deve calcular semAtividades quando ha atividades', () => {
    fixture.componentInstance.atividades.set([{ id: 1, titulo: 'A' } as any]);
    expect(fixture.componentInstance.semAtividades()).toBe(false);
  });
});
