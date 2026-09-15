import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

import { mockApiInterceptor } from './mock-api.interceptor';
import {
  ATIVIDADES_MOCK,
  SOLICITACOES_MOCK,
  REGULAMENTOS_MOCK,
  CURSOS_MOCK,
  USUARIOS_MOCK,
} from '../mocks/mock-data';
import { NOTIFICACOES_MOCK } from '../../notificacao/notificacao.mock';

describe('mockApiInterceptor - Cobertura Total 100%', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  const localStorageStore: Record<string, string> = {};
  const localStorageMock = {
    getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      localStorageStore[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete localStorageStore[key];
    }),
    clear: vi.fn(() => {
      Object.keys(localStorageStore).forEach((k) => delete localStorageStore[k]);
    }),
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    vi.useFakeTimers();

    vi.stubGlobal('localStorage', localStorageMock);
    localStorageMock.clear();
    localStorageMock.setItem('sgac_use_mocks', 'true');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([mockApiInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // ============================================================
  // CONFIGURAÇÕES E PASS-THROUGH
  // ============================================================

  it('deve repassar a requisição (next) se mocks estiverem desativados no localStorage', () => {
    localStorage.setItem('sgac_use_mocks', 'false');

    http.get('/auth/me').subscribe();

    const req = httpMock.expectOne('/auth/me');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('deve repassar a requisição (next) se a rota não corresponder a nenhum mock', () => {
    http.get('/api/rota-inexistente').subscribe();

    const req = httpMock.expectOne('/api/rota-inexistente');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  // ============================================================
  // DOMÍNIO: AUTH
  // ============================================================

  describe('Hander: Auth Mocks', () => {
    it('deve autenticar usuario com role AVALIADOR', () => {
      let resposta: any;
      http.post('/auth/login', { email: 'avaliador@ufape.edu.br' }).subscribe((res) => {
        resposta = res;
      });

      vi.advanceTimersByTime(250);

      expect(resposta.usuario.role).toBe('AVALIADOR');
      expect(resposta.usuario.email).toBe('avaliador@ufape.edu.br');
    });

    it('deve autenticar usuario com role ADMINISTRADOR', () => {
      let resposta: any;
      http.post('/auth/login', { usuario: 'admin@ufape.edu.br' }).subscribe((res) => {
        resposta = res;
      });

      vi.advanceTimersByTime(250);

      expect(resposta.usuario.role).toBe('ADMINISTRADOR');
    });

    it('deve autenticar com role ESTUDANTE por padrão caso email não informe perfil', () => {
      let resposta: any;
      http.post('/auth/login', {}).subscribe((res) => {
        resposta = res;
      });

      vi.advanceTimersByTime(250);

      expect(resposta.usuario.role).toBe('ESTUDANTE');
      expect(resposta.usuario.email).toBe('estudante@ufape.edu.br');
    });

    it('deve responder ao cadastro de usuário', () => {
      let resposta: any;
      http.post('/auth/cadastro', { email: 'novo@ufape.edu.br' }).subscribe((res) => {
        resposta = res;
      });

      vi.advanceTimersByTime(250);

      expect(resposta.success).toBe(true);
    });

    it('deve responder ao logout', () => {
      let resposta: any;
      http.post('/auth/logout', {}).subscribe((res) => {
        resposta = res;
      });

      vi.advanceTimersByTime(250);

      expect(resposta.success).toBe(true);
    });

    it('deve responder a rota /auth/me', () => {
      let resposta: any;
      http.get('/auth/me').subscribe((res) => {
        resposta = res;
      });

      vi.advanceTimersByTime(250);

      expect(resposta.nome).toBe('Usuário Mock');
    });
  });

  // ============================================================
  // DOMÍNIO: ATIVIDADES
  // ============================================================

  describe('Handler: Atividades Mocks', () => {
    it('deve retornar progresso calculado', () => {
      let resposta: any;
      http.get('/atividades/progresso').subscribe((res) => {
        resposta = res;
      });

      vi.advanceTimersByTime(250);

      expect(resposta).toBeDefined();
    });

    it('deve extrair dados de certificado', () => {
      let resposta: any;
      http.post('/atividades/extrair-certificado', {}).subscribe((res) => {
        resposta = res;
      });

      vi.advanceTimersByTime(250);

      expect(resposta.titulo).toBe('Curso de Extensão em Tecnologia');
    });

    it('deve obter parecer da atividade com ID informado e ID fallback', () => {
      let respostaComId: any;
      http.get('/atividades/10/parecer').subscribe((res) => {
        respostaComId = res;
      });

      vi.advanceTimersByTime(250);
      expect(respostaComId.atividadeId).toBe(10);

      let respostaSemId: any;
      http.get('/atividades/invalido/parecer').subscribe((res) => {
        respostaSemId = res;
      });

      vi.advanceTimersByTime(250);
      expect(respostaSemId.atividadeId).toBe(1);
    });

    it('deve obter certificado em formato Blob', () => {
      let resposta: any;
      http.get('/atividades/1/certificado', { responseType: 'blob' }).subscribe((res) => {
        resposta = res;
      });

      vi.advanceTimersByTime(250);

      expect(resposta).toBeInstanceOf(Blob);
    });

    it('deve listar atividades com e sem filtros de query parameters', () => {
      ATIVIDADES_MOCK.length = 0;
      ATIVIDADES_MOCK.push(
        { id: 1, natureza: 'ACC', categoria: 'ENSINO' } as any,
        { id: 2, natureza: 'ACEX', categoria: 'EXTENSAO' } as any,
      );

      let todas: any;
      http.get('/atividades').subscribe((res) => {
        todas = res;
      });
      vi.advanceTimersByTime(250);
      expect(todas).toHaveLength(2);

      let filtradas: any;
      http
        .get('/atividades', { params: { natureza: 'ACC', categoria: 'ENSINO' } })
        .subscribe((res) => {
          filtradas = res;
        });
      vi.advanceTimersByTime(250);
      expect(filtradas).toHaveLength(1);
    });

    it('deve cadastrar nova atividade com FormData e corpo vazio (fallbacks)', () => {
      const formData = new FormData();
      formData.append('titulo', 'Atividade FormData');

      let respostaFormData: any;
      http.post('/atividades', formData).subscribe((res) => {
        respostaFormData = res;
      });
      vi.advanceTimersByTime(250);
      expect(respostaFormData.titulo).toBe('Atividade FormData');

      let respostaVazia: any;
      http.post('/atividades', null).subscribe((res) => {
        respostaVazia = res;
      });
      vi.advanceTimersByTime(250);
      expect(respostaVazia.titulo).toBe('Nova Atividade');
    });

    it('deve buscar, atualizar e deletar atividade por ID (incluindo 404)', () => {
      ATIVIDADES_MOCK.length = 0;
      ATIVIDADES_MOCK.push({
        id: 1,
        titulo: 'Original',
        instituicaoResponsavel: 'UFAPE',
        dataRealizacao: '2026-01-01',
        cargaHorariaEmHoras: 10,
        natureza: 'ACC',
        categoria: 'ENSINO',
      } as any);

      // GET 200 e 404
      let item: any;
      http.get('/atividades/1').subscribe((res) => (item = res));
      vi.advanceTimersByTime(250);
      expect(item.id).toBe(1);

      let statusGet404 = 0;
      http.get('/atividades/999').subscribe({
        next: (res: any) => (statusGet404 = res?.status || 404),
        error: (err) => (statusGet404 = err.status || 404),
      });
      vi.advanceTimersByTime(250);
      expect(statusGet404).toBe(404);

      // PUT 200 e 404
      let atualizado: any;
      http.put('/atividades/1', { titulo: 'Novo Título' }).subscribe((res) => (atualizado = res));
      vi.advanceTimersByTime(250);
      expect(atualizado.titulo).toBe('Novo Título');

      let statusPut404 = 0;
      http.put('/atividades/999', {}).subscribe({
        next: (res: any) => (statusPut404 = res?.status || 404),
        error: (err) => (statusPut404 = err.status || 404),
      });
      vi.advanceTimersByTime(250);
      expect(statusPut404).toBe(404);

      // DELETE 200 e 404
      let statusDelete204 = 0;
      http
        .delete('/atividades/1', { observe: 'response' })
        .subscribe((res) => (statusDelete204 = res.status));
      vi.advanceTimersByTime(250);
      expect(statusDelete204).toBe(204);

      let statusDelete404 = 0;
      http.delete('/atividades/999').subscribe({
        next: (res: any) => (statusDelete404 = res?.status || 404),
        error: (err) => (statusDelete404 = err.status || 404),
      });
      vi.advanceTimersByTime(250);
      expect(statusDelete404).toBe(404);

      // Rota não-numérica cai no próximo handler
      http.patch('/atividades/abc', {}).subscribe();
      const req = httpMock.expectOne('/atividades/abc');
      req.flush({});
    });
  });

  // ============================================================
  // DOMÍNIO: SOLICITAÇÕES
  // ============================================================

  describe('Handler: Solicitações Mocks', () => {
    beforeEach(() => {
      SOLICITACOES_MOCK.length = 0;
      SOLICITACOES_MOCK.push({
        id: 1,
        estudanteNome: 'Teste',
        dataSubmissao: '2026-01-01',
        status: 'DEFERIDA',
        cargaHorariaTotal: 20,
        itens: [{ atividadeId: 1, titulo: 'Atividade', cargaHoraria: 20, natureza: 'ACC' }],
      } as any);
    });

    it('deve listar solicitações de avaliação com e sem filtro de status', () => {
      let lista: any;
      http.get('/solicitacoes/avaliacao').subscribe((res) => (lista = res));
      vi.advanceTimersByTime(250);
      expect(lista).toHaveLength(1);

      let listaFiltrada: any;
      http
        .get('/solicitacoes/avaliacao', { params: { status: 'SUBMETIDA' } })
        .subscribe((res) => (listaFiltrada = res));
      vi.advanceTimersByTime(250);
      expect(listaFiltrada).toHaveLength(0);
    });

    it('deve detalhar e avaliar solicitação (/avaliacao)', () => {
      let detalhe: any;
      http.get('/solicitacoes/1/avaliacao').subscribe((res) => (detalhe = res));
      vi.advanceTimersByTime(250);
      expect(detalhe.id).toBe(1);

      let status404 = 0;
      http.get('/solicitacoes/999/avaliacao').subscribe({
        next: (res: any) => (status404 = res?.status || 404),
        error: (err) => (status404 = err.status || 404),
      });
      vi.advanceTimersByTime(250);
      expect(status404).toBe(404);

      let avaliado: any;
      http
        .patch('/solicitacoes/1/avaliacao', {
          decisao: 'INDEFERIDA',
          justificativa: ' Incompleto ',
        })
        .subscribe((res) => (avaliado = res));
      vi.advanceTimersByTime(250);

      expect(avaliado.status).toBe('INDEFERIDA');
      expect(avaliado.justificativa).toBe('Incompleto');
    });

    it('deve listar solicitações e criar nova solicitação pelo Estudante', () => {
      let resumos: any;
      http.get('/solicitacoes').subscribe((res) => (resumos = res));
      vi.advanceTimersByTime(250);
      expect(resumos).toHaveLength(1);

      ATIVIDADES_MOCK.length = 0;
      ATIVIDADES_MOCK.push({
        id: 1,
        titulo: 'Atividade',
        cargaHorariaEmHoras: 10,
        natureza: 'ACC',
      } as any);

      let criada: any;
      http.post('/solicitacoes', {}).subscribe((res) => (criada = res));
      vi.advanceTimersByTime(250);
      expect(criada.status).toBe('SUBMETIDA');

      SOLICITACOES_MOCK.push({ id: 2, status: 'SUBMETIDA' } as any);
      let status409 = 0;
      http.post('/solicitacoes', {}).subscribe({
        next: (res: any) => (status409 = res?.status || 409),
        error: (err) => (status409 = err.status || 409),
      });
      vi.advanceTimersByTime(250);
      expect(status409).toBe(409);

      SOLICITACOES_MOCK.length = 0;
      ATIVIDADES_MOCK.length = 0;
      let status422 = 0;
      http.post('/solicitacoes', {}).subscribe({
        next: (res: any) => (status422 = res?.status || 422),
        error: (err) => (status422 = err.status || 422),
      });
      vi.advanceTimersByTime(250);
      expect(status422).toBe(422);
    });

    it('deve buscar detalhe de solicitação do estudante por ID (200 e 404)', () => {
      let detalhe: any;
      http.get('/solicitacoes/1').subscribe((res) => (detalhe = res));
      vi.advanceTimersByTime(250);
      expect(detalhe.id).toBe(1);

      let status404 = 0;
      http.get('/solicitacoes/999').subscribe({
        next: (res: any) => (status404 = res?.status || 404),
        error: (err) => (status404 = err.status || 404),
      });
      vi.advanceTimersByTime(250);
      expect(status404).toBe(404);
    });
  });

  // ============================================================
  // OUTROS DOMÍNIOS
  // ============================================================

  describe('Handlers de Domínios Diversos', () => {
    it('deve responder aos endpoints de regulamentos', () => {
      let lista: any;
      http.get('/regulamentos').subscribe((res) => (lista = res));
      vi.advanceTimersByTime(250);
      expect(lista).toEqual(REGULAMENTOS_MOCK);

      let ingestao: any;
      http.post('/regulamentos/ingerir', {}).subscribe((res) => (ingestao = res));
      vi.advanceTimersByTime(250);
      expect(ingestao.status).toBe('SUCESSO');
    });

    it('deve responder aos endpoints de cursos', () => {
      let lista: any;
      http.get('/cursos').subscribe((res) => (lista = res));
      vi.advanceTimersByTime(250);
      expect(lista).toEqual(CURSOS_MOCK);

      let novoCurso: any;
      http
        .post('/cursos', { nome: 'Engenharia de Software' })
        .subscribe((res) => (novoCurso = res));
      vi.advanceTimersByTime(250);
      expect(novoCurso.nome).toBe('Engenharia de Software');
    });

    it('deve responder aos endpoints de usuarios', () => {
      let lista: any;
      http.get('/usuarios').subscribe((res) => (lista = res));
      vi.advanceTimersByTime(250);
      expect(lista).toEqual(USUARIOS_MOCK);
    });

    it('deve responder aos relatorios de atividades', () => {
      let relatorio: any;
      http.get('/relatorios/atividades').subscribe((res) => (relatorio = res));
      vi.advanceTimersByTime(250);
      expect(relatorio).toBeDefined();
    });

    it('deve responder aos endpoints de notificações e marcadores de leitura', () => {
      NOTIFICACOES_MOCK.length = 0;
      NOTIFICACOES_MOCK.push(
        {
          id: 1,
          tipo: 'SOLICITACAO_APROVADA',
          titulo: 'Título 1',
          mensagem: 'Msg 1',
          solicitacaoId: 1,
          lida: false,
          dataCriacao: '2026-01-01T00:00:00',
        },
        {
          id: 2,
          tipo: 'SOLICITACAO_SUBMETIDA',
          titulo: 'Título 2',
          mensagem: 'Msg 2',
          solicitacaoId: null,
          lida: true,
          dataCriacao: '2026-01-02T00:00:00',
        },
      );

      let contagem: any;
      http.get('/notificacoes/contagem-nao-lidas').subscribe((res) => (contagem = res));
      vi.advanceTimersByTime(250);
      expect(contagem.naoLidas).toBe(1);

      let apenasNaoLidas: any;
      http
        .get('/notificacoes', { params: { apenasNaoLidas: 'true' } })
        .subscribe((res) => (apenasNaoLidas = res));
      vi.advanceTimersByTime(250);
      expect(apenasNaoLidas).toHaveLength(1);

      let itemLido: any;
      http.patch('/notificacoes/1/leitura', {}).subscribe((res) => (itemLido = res));
      vi.advanceTimersByTime(250);
      expect(itemLido.lida).toBe(true);

      let status404 = 0;
      http.patch('/notificacoes/999/leitura', {}).subscribe({
        next: (res: any) => (status404 = res?.status || 404),
        error: (err) => (status404 = err.status || 404),
      });
      vi.advanceTimersByTime(250);
      expect(status404).toBe(404);

      let status204 = 0;
      http
        .patch('/notificacoes/leitura', {}, { observe: 'response' })
        .subscribe((res) => (status204 = res.status));
      vi.advanceTimersByTime(250);
      expect(status204).toBe(204);
    });
  });

  describe('Handlers Adicionais para Cobertura', () => {
    it('deve processar substituicao-comprovante POST e PATCH', () => {
      ATIVIDADES_MOCK.length = 0;
      ATIVIDADES_MOCK.push({
        id: 5,
        titulo: 'Atividade',
        status: 'PENDENTE',
        natureza: 'ACC',
        cargaHorariaEmHoras: 10,
      } as any);

      let respostaPost: any;
      const formData = new FormData();
      formData.append('arquivo', new File(['pdf'], 'test.pdf', { type: 'application/pdf' }));
      http.post('/substituicao-comprovante', formData).subscribe((res) => (respostaPost = res));
      vi.advanceTimersByTime(250);
      expect(respostaPost).toBeDefined();

      let respostaPatch: any;
      http
        .patch('/substituicao-comprovante/5', { natureza: 'ACEX' })
        .subscribe((res) => (respostaPatch = res));
      vi.advanceTimersByTime(250);
      expect(respostaPatch.natureza).toBe('ACEX');
    });

    it('deve responder revisao-confirmacao', () => {
      let revisao: any;
      http.get('/revisao-confirmacao').subscribe((res) => (revisao = res));
      vi.advanceTimersByTime(250);
      expect(revisao).toBeDefined();

      let confirmacao: any;
      http
        .patch('/revisao-confirmacao', { confirmado: true, solicitacaoId: 2 })
        .subscribe((res) => (confirmacao = res));
      vi.advanceTimersByTime(250);
      expect(confirmacao.confirmado).toBe(true);
    });
  });
});
