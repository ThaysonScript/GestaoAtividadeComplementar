import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HistoricoParecerService } from './historico-parecer.service';

describe('HistoricoParecerService', () => {
  let service: HistoricoParecerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HistoricoParecerService],
    });
    service = TestBed.inject(HistoricoParecerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve listar por estudante via GET', () => {
    service.listarPorEstudante().subscribe((res) => {
      expect(res.length).toBeGreaterThan(0);
    });
    const req = httpMock.expectOne('http://localhost:8080/api/v1/historico-pareceres');
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        atividadeId: 1,
        titulo: 'Teste',
        natureza: 'ACC',
        categoria: 'ENSINO',
        cargaHorariaEmHoras: 30,
        statusAtual: 'COM_PENDENCIAS',
        pendenciasAtivas: true,
        pareceres: [],
      },
    ]);
  });

  it('deve traduzir erro 403', () => {
    service.listarPorEstudante().subscribe({
      error: (err: Error) => {
        expect(err.message).toContain('Apenas estudantes');
      },
    });
    const req = httpMock.expectOne('http://localhost:8080/api/v1/historico-pareceres');
    req.flush('Apenas estudantes podem consultar o histórico.', { status: 403, statusText: 'Forbidden' });
  });

  it('deve listar vazio quando resposta e vazia', () => {
    service.listarPorEstudante().subscribe((res) => {
      expect(res.length).toBe(0);
    });
    const req = httpMock.expectOne('http://localhost:8080/api/v1/historico-pareceres');
    req.flush([]);
  });

  it('deve buscar por atividade via GET', () => {
    service.buscarPorAtividade(1).subscribe((res) => {
      expect(res.length).toBe(1);
    });
    const req = httpMock.expectOne('http://localhost:8080/api/v1/historico-pareceres/atividade/1');
    expect(req.request.method).toBe('GET');
    req.flush([
      { id: 101, atividadeId: 1, dataAvaliacao: '2026-08-20', tipoParecer: 'CORRECAO' as any },
    ]);
  });
});
