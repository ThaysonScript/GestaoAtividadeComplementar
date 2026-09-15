import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AtividadeService } from './atividade.service';
import { Categoria, Natureza } from './atividade.model';
import { API_BASE_URL } from '../api.config';

const ATIVIDADES_URL = `${API_BASE_URL}/atividades`;

describe('AtividadeService', () => {
  let service: AtividadeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [AtividadeService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AtividadeService);
    httpMock = TestBed.inject(HttpTestingController);

    // Esvazia requisições automáticas disparadas na criação do serviço
    const reqsIniciais = httpMock.match(ATIVIDADES_URL);
    reqsIniciais.forEach((req) => req.flush([{ id: 1, titulo: 'Atividade Base' }]));
  });

  afterEach(() => {
    const pendentes = httpMock.match(() => true);
    pendentes.forEach((req) => req.flush([]));
    httpMock.verify();
  });

  it('deve buscar atividade por ID', () => {
    let atividadeEncontrada: any;
    service.buscarPorId(1).subscribe((res: any) => (atividadeEncontrada = res));

    const req = httpMock.expectOne(`${ATIVIDADES_URL}/1`);
    req.flush({ id: 1, titulo: 'Atividade 1' });

    expect(atividadeEncontrada?.id).toBe(1);
  });

  it('deve lançar erro se a atividade não for encontrada por ID', () => {
    let erro: Error | undefined;
    service.buscarPorId(999).subscribe({ error: (e: Error) => (erro = e) });

    const req = httpMock.expectOne(`${ATIVIDADES_URL}/999`);
    req.flush(null, { status: 404, statusText: 'Not Found' });

    expect(erro?.message).toBe('Atividade não encontrada.');
  });

  it('deve excluir atividade por ID', () => {
    service.excluir(1).subscribe();
    const req = httpMock.expectOne(`${ATIVIDADES_URL}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('deve obter parecer de IA e tratar erros com mensagem personalizada', () => {
    service.obterParecer(1).subscribe();
    const req = httpMock.expectOne(`${ATIVIDADES_URL}/1/parecer`);
    expect(req.request.method).toBe('GET');
    req.flush({ decisaoIA: 'DEFERIDO' });

    let erro: Error | undefined;
    service.obterParecer(2).subscribe({ error: (e: Error) => (erro = e) });
    httpMock
      .expectOne(`${ATIVIDADES_URL}/2/parecer`)
      .flush({ message: 'Falha na IA' }, { status: 500, statusText: 'Error' });
    expect(erro?.message).toBe('Falha na IA');
  });

  it('deve extrair dados do certificado via POST', () => {
    const file = new File([''], 'cert.pdf');
    service.extrairDadosCertificado(file).subscribe();
    const req = httpMock.expectOne(`${ATIVIDADES_URL}/extrair-certificado`);
    expect(req.request.method).toBe('POST');
    req.flush({ titulo: 'Extraido' });
  });

  it('deve obter certificado em Blob e tratar erro 404', () => {
    service.obterCertificado(1).subscribe((blob: Blob) => expect(blob).toBeTruthy());
    const req = httpMock.expectOne(`${ATIVIDADES_URL}/1/certificado`);
    expect(req.request.method).toBe('GET');
    req.flush(new Blob(['pdf content']));

    let erro: Error | undefined;
    service.obterCertificado(2).subscribe({ error: (e: Error) => (erro = e) });
    httpMock
      .expectOne(`${ATIVIDADES_URL}/2/certificado`)
      .flush(null, { status: 404, statusText: 'Not Found' });
    expect(erro?.message).toBe('Não foi possível carregar o arquivo do certificado.');
  });

  it('deve traduzir 403 no cadastro, edicao e listagem', () => {
    let errCad: Error | undefined;
    let errEdit: Error | undefined;
    let errList: Error | undefined;

    const dummyFile = new File([''], 'a.pdf');
    service
      .cadastrar({
        titulo: 'A',
        instituicaoResponsavel: 'B',
        dataRealizacao: '2026-01-01',
        cargaHoraria: 10,
        natureza: Natureza.ACC,
        categoria: Categoria.ENSINO,
        arquivo: dummyFile,
      })
      .subscribe({ error: (e: Error) => (errCad = e) });
    httpMock.expectOne(ATIVIDADES_URL).flush(null, { status: 403, statusText: 'Forbidden' });

    service
      .atualizar(1, {
        titulo: 'A',
        dataRealizacao: '2026-01-01',
        cargaHoraria: 10,
        natureza: Natureza.ACC,
        categoria: Categoria.ENSINO,
        arquivo: null,
      })
      .subscribe({ error: (e: Error) => (errEdit = e) });
    httpMock.expectOne(`${ATIVIDADES_URL}/1`).flush(null, { status: 403, statusText: 'Forbidden' });

    service.listar().subscribe({ error: (e: Error) => (errList = e) });
    httpMock.expectOne(ATIVIDADES_URL).flush(null, { status: 403, statusText: 'Forbidden' });

    expect(errCad?.message).toBe('Apenas estudantes podem cadastrar atividades.');
    expect(errEdit?.message).toBe('Você não tem permissão para editar esta atividade.');
    expect(errList?.message).toBe('Apenas estudantes podem consultar suas atividades.');
  });
});
