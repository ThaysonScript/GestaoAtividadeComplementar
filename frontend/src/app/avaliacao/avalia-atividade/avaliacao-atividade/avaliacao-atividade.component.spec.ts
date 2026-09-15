import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AvaliacaoAtividadeComponent } from './avaliacao-atividade.component';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AtividadeService } from '../../../atividades/atividade.service';
import { AvaliacaoService } from '../../avaliacao.service';
import { HistoricoParecerService } from '../../../pendencias/historico-parecer.service';

describe('AvaliacaoAtividadeComponent', () => {
  let component: AvaliacaoAtividadeComponent;
  let fixture: ComponentFixture<AvaliacaoAtividadeComponent>;

  const mockAtividadeService = {
    buscarPorId: vi.fn().mockReturnValue(
      of({
        id: 1,
        titulo: 'Teste',
        status: 'PENDENTE',
        natureza: 'ACC',
        categoria: 'ACC',
        cargaHorariaEmHoras: 30,
        instituicaoResponsavel: 'UFPE',
        dataRealizacao: '2024-01-01',
      }),
    ),
    obterParecer: vi.fn().mockReturnValue(of({ decisaoIA: 'CONFORME', categoriaSugerida: 'ACC' })),
    obterCertificado: vi.fn().mockReturnValue(of(new Blob())),
  };

  const mockAvaliacaoService = {
    detalhar: vi.fn().mockReturnValue(
      of({
        id: 1,
        status: 'SUBMETIDA',
        itens: [{ atividadeId: 1, titulo: 'Teste', status: 'PENDENTE', justificativa: '' }],
      }),
    ),
    avaliarPorAtividade: vi.fn().mockReturnValue(of({})),
  };

  const mockHistoricoService = {
    buscarPorAtividade: vi.fn().mockReturnValue(of([])),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvaliacaoAtividadeComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: () => '1' },
              queryParamMap: { get: () => '10' },
            },
          },
        },
        { provide: AtividadeService, useValue: mockAtividadeService },
        { provide: AvaliacaoService, useValue: mockAvaliacaoService },
        { provide: HistoricoParecerService, useValue: mockHistoricoService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(AvaliacaoAtividadeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('deve carregar dados no ngOnInit', () => {
    fixture.detectChanges();
    expect(component.atividadeId).toBe(1);
  });

  it('isJustificativaObrigatoria deve ser true para REJEITADA', () => {
    component.decisaoSelecionada.set('REJEITADA');
    expect(component.isJustificativaObrigatoria()).toBe(true);
  });

  it('isJustificativaObrigatoria deve ser true para COM_PENDENCIAS', () => {
    component.decisaoSelecionada.set('COM_PENDENCIAS');
    expect(component.isJustificativaObrigatoria()).toBe(true);
  });

  it('isDecisaoInvalida deve ser true quando enviando', () => {
    component.enviandoDecisao.set(true);
    expect(component.isDecisaoInvalida()).toBe(true);
  });

  it('deve abrir e fechar modal de decisao', () => {
    component.abrirModalDecisao('APROVADA');
    expect(component.modalDecisaoAberto()).toBe(true);
    component.fecharModalDecisao();
    expect(component.modalDecisaoAberto()).toBe(false);
  });

  it('fecharModalDecisao nao fecha se enviando', () => {
    component.enviandoDecisao.set(true);
    component.abrirModalDecisao('APROVADA');
    component.fecharModalDecisao();
    expect(component.modalDecisaoAberto()).toBe(true);
  });

  it('carregarDados com atividadeId 0 deve mostrar erro', () => {
    component.atividadeId = 0;
    component.solicitacaoId = 0;
    component.carregarDados();
    expect(component.mensagemErro()).toContain('não informado');
  });

  it('carregarParecerEHistorico nao faz nada sem atividadeId', () => {
    component.atividadeId = 0;
    component.carregarParecerEHistorico();
    expect(component.historico).toHaveLength(0);
  });

  it('deve abrir e fechar visualizacao', () => {
    component.atividadeId = 1;
    component.atividade = {
      id: 1,
      titulo: 'T',
      status: 'PENDENTE',
      natureza: 'ACC',
      categoria: 'ACC',
      cargaHorariaEmHoras: 30,
      instituicaoResponsavel: 'UFPE',
      dataRealizacao: '2024-01-01',
    } as any;
    component.visualizarCertificado();
    expect(component.modalVisualizacaoAberto()).toBe(true);
    component.fecharModalVisualizacao();
    expect(component.modalVisualizacaoAberto()).toBe(false);
  });

  it('confirmarDecisao deve atualizar sucesso', () => {
    component.solicitacaoId = 10;
    component.atividadeId = 1;
    component.decisaoSelecionada.set('APROVADA');
    component.justificativa.set('ok');
    component.confirmarDecisao();
    expect(component.modalDecisaoAberto()).toBe(false);
  });

  it('confirmarDecisao nao faz nada se solicitacaoId for 0', () => {
    component.solicitacaoId = 0;
    component.atividadeId = 1;
    component.confirmarDecisao();
    expect(component.modalDecisaoAberto()).toBe(false);
  });

  it('isDecisaoInvalida deve ser true para COM_PENDENCIAS sem justificativa', () => {
    component.decisaoSelecionada.set('COM_PENDENCIAS');
    component.justificativa.set('');
    component.enviandoDecisao.set(false);
    expect(component.isDecisaoInvalida()).toBe(true);
  });

  it('confirmarDecisao nao faz nada sem solicitacaoId', () => {
    component.solicitacaoId = 0;
    component.atividadeId = 1;
    component.confirmarDecisao();
    expect(component.modalDecisaoAberto()).toBe(false);
  });
});
