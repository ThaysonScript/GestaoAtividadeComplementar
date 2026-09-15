import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of } from 'rxjs';
import { PendenciasHistoricoComponent } from './pendencias-historico.component';
import { HistoricoParecerService } from './historico-parecer.service';

describe('PendenciasHistoricoComponent', () => {
  let fixture: ComponentFixture<PendenciasHistoricoComponent>;
  let componente: PendenciasHistoricoComponent;
  let listarMock: Subject<any[]>;

  beforeEach(async () => {
    listarMock = new Subject<any[]>();
    await TestBed.configureTestingModule({
      imports: [PendenciasHistoricoComponent],
      providers: [
        provideRouter([]),
        {
          provide: HistoricoParecerService,
          useValue: {
            listarPorEstudante: () => listarMock.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PendenciasHistoricoComponent);
    componente = fixture.componentInstance;
  });

  it('deve ser criado', () => {
    fixture.detectChanges();
    expect(componente).toBeTruthy();
  });

  it('deve exibir estado de carregamento inicialmente', () => {
    fixture.detectChanges();
    expect(componente.carregando()).toBe(true);
  });

  it('deve calcular sem atividades quando lista esta vazia e nao esta carregando', () => {
    listarMock.next([]);
    fixture.detectChanges();
    componente['carregando'].set(false);
    fixture.detectChanges();
    expect(componente.semAtividades()).toBe(true);
  });

  it('deve diferenciar destaque visual por tipo de parecer', () => {
    expect(componente.classeParecer('CORRECAO')).toContain('bg-[#ffdad6]');
    expect(componente.classeParecer('PRE_APROVADO')).toContain('bg-[#e6efe9]');
    expect(componente.classeParecer('MANTIDO')).toContain('bg-[#fff8e1]');
  });

  it('deve formatar data corretamente', () => {
    expect(componente.dataFormatada('2026-08-20T10:30:00')).toBe('20/08/2026');
  });

  it('deve calcular temPendencias quando ha atividades com pendencias ativas', () => {
    fixture.detectChanges();
    listarMock.next([
      {
        atividadeId: 1,
        titulo: 'Teste',
        natureza: 'ACC',
        categoria: 'ENSINO',
        cargaHorariaEmHoras: 10,
        statusAtual: 'COM_PENDENCIAS',
        pendenciasAtivas: true,
        pareceres: [],
      },
    ]);
    expect(componente.temPendencias()).toBe(true);
  });
});
