import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RevisaoConfirmacaoService } from './revisao-confirmacao.service';

describe('RevisaoConfirmacaoService', () => {
  let service: RevisaoConfirmacaoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RevisaoConfirmacaoService],
    });
    service = TestBed.inject(RevisaoConfirmacaoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve listar revisao via GET', () => {
    service.listar().subscribe((res) => {
      expect(res.solicitacaoId).toBe(8);
    });
    const req = httpMock.expectOne('/revisao-confirmacao');
    expect(req.request.method).toBe('GET');
    req.flush({ solicitacaoId: 8, itensCorrigidos: [], novosComprovantes: [], statusAnterior: 'COM_PENDENCIAS', statusNovo: 'SUBMETIDA' });
  });

  it('deve confirmar revisao via PATCH', () => {
    service.confirmar(8).subscribe((res) => {
      expect(res.confirmado).toBe(true);
    });
    const req = httpMock.expectOne('/revisao-confirmacao');
    expect(req.request.method).toBe('PATCH');
    req.flush({ solicitacaoId: 8, itensCorrigidos: [], novosComprovantes: [], statusAnterior: 'COM_PENDENCIAS', statusNovo: 'SUBMETIDA', confirmado: true, bloqueado: true });
  });

  it('deve traduzir erro 403', () => {
    service.listar().subscribe({
      error: (err: Error) => {
        expect(err.message).toContain('Apenas estudantes');
      },
    });
    const req = httpMock.expectOne('/revisao-confirmacao');
    req.flush('Apenas estudantes podem confirmar o reenvio.', { status: 403, statusText: 'Forbidden' });
  });
});
