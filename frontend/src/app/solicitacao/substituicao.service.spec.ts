import { TestBed } from '@angular/core/testing';
import { SubstituicaoService } from './substituicao.service';
import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('SubstituicaoService', () => {
  let service: SubstituicaoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SubstituicaoService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SubstituicaoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deve chamar endpoint de substituicao', () => {
    const file = new File(['teste'], 'teste.pdf', { type: 'application/pdf' });
    service.substituir(1, file).subscribe((res) => expect(res).toBeTruthy());
    const req = httpMock.expectOne((r) => r.method === 'POST');
    req.flush({ id: 1, titulo: 'T', status: 'PENDENTE' });
  });

  it('deve atualizar metadados', () => {
    service.atualizarMetadados(1, { titulo: 'Novo' }).subscribe();
    const req = httpMock.expectOne((r) => r.method === 'PATCH');
    req.flush({ id: 1, titulo: 'Novo', status: 'PENDENTE' });
  });

  it('deve tratar erro 403', () => {
    let erro: Error | undefined;
    service.substituir(1, null).subscribe({ error: (e: Error) => (erro = e) });
    const req = httpMock.expectOne((r) => r.method === 'POST');
    req.flush({ message: 'Negado' }, { status: 403, statusText: 'Forbidden' });
    expect(erro?.message).toContain('Negado');
  });

  it('deve tratar erro 422', () => {
    let erro: Error | undefined;
    service.substituir(1, null).subscribe({ error: (e: Error) => (erro = e) });
    const req = httpMock.expectOne((r) => r.method === 'POST');
    req.flush({ message: 'Invalido' }, { status: 422, statusText: 'Unprocessable' });
    expect(erro?.message).toContain('Invalido');
  });

  it('deve tratar erro com mensagem comum', () => {
    let erro: Error | undefined;
    service.atualizarMetadados(1, {}).subscribe({ error: (e: Error) => (erro = e) });
    const req = httpMock.expectOne((r) => r.method === 'PATCH');
    req.flush('erro-comum', { status: 500, statusText: 'Server Error' });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
