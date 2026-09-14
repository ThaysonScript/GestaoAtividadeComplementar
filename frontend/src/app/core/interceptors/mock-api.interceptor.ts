import { HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ATIVIDADES_MOCK,
  SOLICITACOES_MOCK,
  REGULAMENTOS_MOCK,
  CURSOS_MOCK,
  USUARIOS_MOCK,
  REVISAO_CONFIRMACAO_MOCK,
  gerarTokenMock,
  obterProgressoCalculado,
  obterRelatorioCalculado,
} from '../mocks/mock-data';
import { NOTIFICACOES_MOCK } from '../../notificacao/notificacao.mock';
import { Atividade } from '../../atividades/atividade.model';
import { SolicitacaoAvaliadorDetalhe } from '../../avaliacao/avaliacao.model';

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  const overrideRuntime =
    typeof window !== 'undefined' ? localStorage.getItem('sgac_use_mocks') : null;
  const mocksAtivos = overrideRuntime !== null ? overrideRuntime === 'true' : environment.useMocks;

  if (!mocksAtivos) {
    return next(req);
  }

  const url = req.url.split('?')[0].replace(/\/$/, '').trimEnd();
  const method = req.method.toUpperCase();

  return processarRotasMock(req, url, method) ?? next(req);
};

function processarRotasMock(
  req: HttpRequest<unknown>,
  url: string,
  method: string,
): Observable<HttpResponse<unknown>> | null {
  return (
    handleAuthMocks(req, url, method) ??
    handleAtividadesMocks(req, url, method) ??
    handleSolicitacoesMocks(req, url, method) ??
    handleRegulamentosMocks(req, url, method) ??
    handleCursosMocks(req, url, method) ??
    handleUsuariosMocks(req, url, method) ??
    handleRelatoriosMocks(req, url, method) ??
    handleNotificacoesMocks(req, url, method) ??
    handleRevisaoConfirmacaoMocks(req, url, method)
  );
}

// --- Handlers Específicos por Domínio ---

function handleAuthMocks(
  req: HttpRequest<unknown>,
  url: string,
  method: string,
): Observable<HttpResponse<unknown>> | null {
  if (url.endsWith('/auth/login') && method === 'POST') {
    const body = (req.body ?? {}) as { usuario?: string; email?: string };
    const email = (body?.usuario || body?.email || 'estudante@ufape.edu.br').toLowerCase();
    const role = obterRolePorEmail(email);

    function obterRolePorEmail(email: string): 'ESTUDANTE' | 'AVALIADOR' | 'ADMINISTRADOR' {
      if (email.includes('avaliador')) return 'AVALIADOR';
      if (email.includes('admin')) return 'ADMINISTRADOR';
      return 'ESTUDANTE';
    }

    return jsonResponse(200, {
      token: gerarTokenMock(email, role),
      tipo: 'Bearer',
      usuario: { email, role },
    });
  }

  if (url.endsWith('/auth/cadastro') && method === 'POST') {
    return jsonResponse(201, { message: 'Cadastro realizado com sucesso.', success: true });
  }

  if (url.endsWith('/auth/logout') && method === 'POST') {
    return jsonResponse(200, { message: 'Sessão encerrada com sucesso.', success: true });
  }

  if (url.endsWith('/auth/me') && method === 'GET') {
    return jsonResponse(200, {
      id: '1',
      nome: 'Usuário Mock',
      email: 'estudante@ufape.edu.br',
      role: 'ESTUDANTE',
    });
  }

  return null;
}

function handleAtividadesMocks(
  req: HttpRequest<unknown>,
  url: string,
  method: string,
): Observable<HttpResponse<unknown>> | null {
  if (!url.includes('/atividades')) return null;
  if (url.includes('/relatorios')) return null;

  if (url.endsWith('/atividades/progresso') && method === 'GET') {
    return jsonResponse(200, obterProgressoCalculado());
  }

  if (url.endsWith('/atividades/extrair-certificado') && method === 'POST') {
    return jsonResponse(200, criarPayloadCertificado());
  }

  if (url.includes('/parecer') && method === 'GET') {
    const id = obterIdDeUrl(url, '/atividades/', '/parecer');
    return jsonResponse(200, criarPayloadParecer(id));
  }

  if (url.includes('/certificado') && method === 'GET') {
    return criarPayloadCertificadoPDF();
  }

  if (url.endsWith('/atividades')) {
    if (method === 'GET') {
      return jsonResponse(200, filtrarAtividadesPorParametros(req));
    }

    if (method === 'POST') {
      const bodyObj = extrairDadosCorpo(req);
      const novaAtividade = criarNovaAtividade(bodyObj);
      ATIVIDADES_MOCK.push(novaAtividade);
      return jsonResponse(201, novaAtividade);
    }
  }

  const idSeg = obterIdDeUrl(url, '/atividades/', '');
  return handleAtividadesIdRoutes(req, idSeg, method);
}

function obterIdDeUrl(url: string, prefixo: string, sufixo: string): string | null {
  const partes = url.split(prefixo);
  if (partes.length < 2) return null;
  const id = partes[1].split(sufixo)[0];
  return id || null;
}

function criarPayloadCertificado(): Record<string, unknown> {
  return {
    titulo: 'Curso de Extensão em Tecnologia',
    instituicaoResponsavel: 'UFAPE',
    dataRealizacao: '2026-05-10',
    cargaHoraria: 20,
    natureza: 'ACC',
    categoria: 'ENSINO',
  };
}

function criarPayloadParecer(id: string | null): Record<string, unknown> {
  const idFinal = id ? Number(id) : 1;
  return {
    id: idFinal || 1,
    atividadeId: idFinal || 1,
    naturezaSugerida: 'ACC',
    categoriaSugerida: 'ENSINO',
    cargaHorariaAproveitavel: 30,
    artigoRegulamento: 'Art. 12',
    justificativaTecnica: 'Atividade compatível com os critérios do PPC.',
    scoreConfianca: 0.95,
    decisaoIA: 'DEFERIDO',
    tempoProcessamentoMs: 350,
  };
}

function criarPayloadCertificadoPDF(): Observable<HttpResponse<unknown>> {
  const blob = new Blob(['mock-pdf-content'], { type: 'application/pdf' });
  return of(new HttpResponse({ status: 200, body: blob })).pipe(delay(200));
}

function filtrarAtividadesPorParametros(req: HttpRequest<unknown>): Atividade[] {
  const natureza = req.params.get('natureza');
  const categoria = req.params.get('categoria');
  let lista = [...ATIVIDADES_MOCK];
  if (natureza) lista = lista.filter((a) => a.natureza === natureza);
  if (categoria) lista = lista.filter((a) => a.categoria === categoria);
  return lista;
}

function criarNovaAtividade(bodyObj: Record<string, unknown>): Atividade {
  return {
    id: Date.now(),
    titulo: obterValorStringOuPadrao(bodyObj['titulo'], 'Nova Atividade'),
    instituicaoResponsavel: obterValorStringOuPadrao(bodyObj['instituicaoResponsavel'], 'UFAPE'),
    dataRealizacao: obterValorStringOuPadrao(
      bodyObj['dataRealizacao'],
      new Date().toISOString().split('T')[0],
    ),
    cargaHorariaEmHoras: Number(bodyObj['cargaHoraria'] ?? 10),
    natureza: obterValorStringOuPadrao(bodyObj['natureza'], 'ACC'),
    categoria: obterValorStringOuPadrao(bodyObj['categoria'], 'ENSINO'),
    dataCadastro: new Date().toISOString(),
    status: 'PENDENTE',
  };
}

function handleAtividadesIdRoutes(
  req: HttpRequest<unknown>,
  idSeg: string | null,
  method: string,
): Observable<HttpResponse<unknown>> | null {
  const idNum = idSeg ? Number(idSeg) : Number.NaN;
  if (Number.isNaN(idNum)) return null;

  const index = ATIVIDADES_MOCK.findIndex((a) => a.id === idNum);

  if (index === -1) return jsonResponse(404, { message: 'Atividade não encontrada.' });

  const handlers: Record<string, () => Observable<HttpResponse<unknown>> | null> = {
    GET: () => jsonResponse(200, ATIVIDADES_MOCK[index]),
    PUT: () => atualizarAtividade(req, index),
    DELETE: () => deletarAtividade(index),
  };

  const handler = handlers[method];
  return handler ? handler() : null;
}

function atualizarAtividade(
  req: HttpRequest<unknown>,
  index: number,
): Observable<HttpResponse<unknown>> {
  const bodyObj = extrairDadosCorpo(req);
  const atividadeAnterior = ATIVIDADES_MOCK[index];
  ATIVIDADES_MOCK[index] = {
    ...atividadeAnterior,
    titulo: obterValorStringOuPadrao(bodyObj['titulo'], atividadeAnterior.titulo),
    instituicaoResponsavel: obterValorStringOuPadrao(
      bodyObj['instituicaoResponsavel'],
      atividadeAnterior.instituicaoResponsavel,
    ),
    dataRealizacao: obterValorStringOuPadrao(
      bodyObj['dataRealizacao'],
      atividadeAnterior.dataRealizacao,
    ),
    cargaHorariaEmHoras: Number(bodyObj['cargaHoraria'] ?? atividadeAnterior.cargaHorariaEmHoras),
    natureza: obterValorStringOuPadrao(bodyObj['natureza'], atividadeAnterior.natureza),
    categoria: obterValorStringOuPadrao(bodyObj['categoria'], atividadeAnterior.categoria),
  };
  return jsonResponse(200, ATIVIDADES_MOCK[index]);
}

function obterValorStringOuPadrao(valor: unknown, padrao: string): string {
  return typeof valor === 'string' ? valor : padrao;
}

function deletarAtividade(index: number): Observable<HttpResponse<unknown>> {
  ATIVIDADES_MOCK.splice(index, 1);
  return jsonResponse(204, null);
}

function handleSolicitacoesMocks(
  req: HttpRequest<unknown>,
  url: string,
  method: string,
): Observable<HttpResponse<unknown>> | null {
  if (!url.includes('/solicitacoes')) return null;

  const idSeg = obterIdDeUrl(url, '/solicitacoes/', '');
  const idAvaliacaoSeg = obterIdDeUrl(url, '/solicitacoes/', '/avaliacao');

  const handlers = [
    () => handleRotaAvaliacao(req, url, method, idSeg),
    () => handleRotaEstudante(req, url, method, idSeg),
    () => handleRotaAvaliacaoId(req, url, method, idAvaliacaoSeg),
  ];

  for (const handler of handlers) {
    const result = handler();
    if (result !== null) return result;
  }

  return null;
}

function handleRotaAvaliacao(
  req: HttpRequest<unknown>,
  url: string,
  method: string,
  _idSeg: string | null,
): Observable<HttpResponse<unknown>> | null {
  if (url.endsWith('/solicitacoes/avaliacao') && method === 'GET') {
    return processarSolicitacoesParaAvaliacao(req);
  }
  return null;
}

function processarSolicitacoesParaAvaliacao(
  req: HttpRequest<unknown>,
): Observable<HttpResponse<unknown>> {
  const statusFiltro = req.params.get('status');
  let resumos = SOLICITACOES_MOCK.map((s) => ({
    id: s.id,
    estudanteNome: s.estudanteNome,
    dataSubmissao: s.dataSubmissao,
    status: s.status,
    dataAvaliacao: s.dataAvaliacao,
    totalAtividades: s.itens.length,
    cargaHorariaTotal: s.cargaHorariaTotal,
  }));

  if (statusFiltro) {
    resumos = resumos.filter((r) => r.status === statusFiltro);
  }
  return jsonResponse(200, resumos);
}

function handleRotaAvaliacaoId(
  req: HttpRequest<unknown>,
  url: string,
  method: string,
  idSeg: string | null,
): Observable<HttpResponse<unknown>> | null {
  if (!url.includes('/avaliacao')) return null;

  if (!idSeg || Number.isNaN(Number(idSeg))) {
    return jsonResponse(404, { message: 'Solicitação não encontrada.' });
  }

  const idNum = Number(idSeg);
  const index = SOLICITACOES_MOCK.findIndex((s) => s.id === idNum);

  if (index === -1) {
    return jsonResponse(404, { message: 'Solicitação não encontrada.' });
  }

  if (method === 'GET') {
    return jsonResponse(200, SOLICITACOES_MOCK[index]);
  }

  if (method === 'PATCH') {
    return avaliarSolicitacao(req, index);
  }

  return null;
}

function avaliarSolicitacao(
  req: HttpRequest<unknown>,
  index: number,
): Observable<HttpResponse<unknown>> {
  const body = (req.body ?? {}) as { decisao?: string; justificativa?: string };
  const novaDecisao = (body.decisao as any) ?? 'APROVADA';
  SOLICITACOES_MOCK[index] = {
    ...SOLICITACOES_MOCK[index],
    status: novaDecisao,
    justificativa: body.justificativa?.trim() || undefined,
    dataAvaliacao: new Date().toISOString(),
  };
  return jsonResponse(200, SOLICITACOES_MOCK[index]);
}

function handleRotaEstudante(
  req: HttpRequest<unknown>,
  url: string,
  method: string,
  idSeg: string | null,
): Observable<HttpResponse<unknown>> | null {
  if (url.endsWith('/solicitacoes')) {
    if (method === 'GET') {
      return jsonResponse(200, criarResumosEstudante());
    }

    if (method === 'POST') {
      return criarNovaSolicitacao();
    }
  }

  if (idSeg && !Number.isNaN(Number(idSeg)) && method === 'GET') {
    return obterDetalheEstudante(idSeg);
  }

  return null;
}

function criarResumosEstudante() {
  return SOLICITACOES_MOCK.map((s) => ({
    id: s.id,
    status: s.status,
    dataSubmissao: s.dataSubmissao,
    dataAvaliacao: s.dataAvaliacao,
    totalAtividades: s.itens.length,
  }));
}

function criarNovaSolicitacao(): Observable<HttpResponse<unknown>> {
  if (SOLICITACOES_MOCK.some((s) => s.status === 'SUBMETIDA' || s.status === 'EM_ANALISE')) {
    return jsonResponse(409, {
      message:
        'Você possui uma solicitação em aberto. Acompanhe o andamento antes de enviar outra.',
    });
  }

  const itens = ATIVIDADES_MOCK.map((a) => ({
    atividadeId: a.id,
    titulo: a.titulo,
    cargaHoraria: a.cargaHorariaEmHoras,
    natureza: a.natureza,
  }));

  if (itens.length === 0) {
    return jsonResponse(422, {
      message: 'Cadastre ao menos uma atividade antes de enviar o relatório para validação.',
    });
  }

  const novaSolicitacao: SolicitacaoAvaliadorDetalhe = {
    id: Date.now(),
    estudanteNome: 'Estudante Teste UFAPE',
    estudanteEmail: 'estudante@ufape.edu.br',
    dataSubmissao: new Date().toISOString(),
    status: 'SUBMETIDA',
    cargaHorariaTotal: itens.reduce((acc, cur) => acc + cur.cargaHoraria, 0),
    itens: itens,
  };

  SOLICITACOES_MOCK.push(novaSolicitacao);

  const detalheEstudante = {
    id: novaSolicitacao.id,
    status: novaSolicitacao.status,
    dataSubmissao: novaSolicitacao.dataSubmissao,
    totalAtividades: novaSolicitacao.itens.length,
    itens: novaSolicitacao.itens,
  };

  return jsonResponse(201, detalheEstudante);
}

function obterDetalheEstudante(idSeg: string): Observable<HttpResponse<unknown>> {
  const idNum = Number(idSeg);
  const item = SOLICITACOES_MOCK.find((s) => s.id === idNum);
  if (!item) {
    return jsonResponse(404, { message: 'Solicitação não encontrada.' });
  }
  const detalheEstudante = {
    id: item.id,
    status: item.status,
    dataSubmissao: item.dataSubmissao,
    dataAvaliacao: item.dataAvaliacao,
    totalAtividades: item.itens.length,
    justificativa: item.justificativa,
    itens: item.itens,
  };
  return jsonResponse(200, detalheEstudante);
}

function handleRegulamentosMocks(
  req: HttpRequest<unknown>,
  url: string,
  method: string,
): Observable<HttpResponse<unknown>> | null {
  if (!url.includes('/regulamentos')) return null;

  if (url.endsWith('/regulamentos') && method === 'GET') {
    return jsonResponse(200, REGULAMENTOS_MOCK);
  }

  if (url.includes('/regulamentos/ingerir') && method === 'POST') {
    return jsonResponse(200, {
      nomeDocumento: 'regulamento.pdf',
      totalChunksExtraidos: 4,
      status: 'SUCESSO',
      mensagem: '4 normas extraídas e vetorizadas com sucesso.',
    });
  }

  return null;
}

function handleCursosMocks(
  req: HttpRequest<unknown>,
  url: string,
  method: string,
): Observable<HttpResponse<unknown>> | null {
  if (!url.includes('/cursos')) return null;

  if (method === 'GET') {
    return jsonResponse(200, CURSOS_MOCK);
  }

  if (method === 'POST') {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const novoCurso = { id: Date.now(), ...body };
    CURSOS_MOCK.push(novoCurso as any);
    return jsonResponse(201, novoCurso);
  }

  return null;
}

function handleUsuariosMocks(
  req: HttpRequest<unknown>,
  url: string,
  method: string,
): Observable<HttpResponse<unknown>> | null {
  if (!url.includes('/usuarios')) return null;

  if (method === 'GET') {
    return jsonResponse(200, USUARIOS_MOCK);
  }

  return null;
}

function handleRelatoriosMocks(
  req: HttpRequest<unknown>,
  url: string,
  method: string,
): Observable<HttpResponse<unknown>> | null {
  if (url.endsWith('/relatorios/atividades') && method === 'GET') {
    return jsonResponse(200, obterRelatorioCalculado('estudante@ufape.edu.br'));
  }

  return null;
}

function handleNotificacoesMocks(
  req: HttpRequest<unknown>,
  url: string,
  method: string,
): Observable<HttpResponse<unknown>> | null {
  if (!url.includes('/notificacoes')) return null;

  if (url.endsWith('/notificacoes/contagem-nao-lidas') && method === 'GET') {
    const naoLidas = NOTIFICACOES_MOCK.filter((n) => !n.lida).length;
    return jsonResponse(200, { naoLidas });
  }

  if (url.endsWith('/notificacoes') && method === 'GET') {
    const apenasNaoLidas = req.params.get('apenasNaoLidas') === 'true';
    const lista = apenasNaoLidas ? NOTIFICACOES_MOCK.filter((n) => !n.lida) : NOTIFICACOES_MOCK;
    return jsonResponse(200, lista);
  }

  if (url.includes('/leitura') && method === 'PATCH') {
    const idSeg = url.split('/notificacoes/')[1]?.split('/leitura')[0];
    if (idSeg && !Number.isNaN(Number(idSeg))) {
      const idNum = Number(idSeg);
      const item = NOTIFICACOES_MOCK.find((n) => n.id === idNum);
      if (item) {
        item.lida = true;
        return jsonResponse(200, item);
      }
      return jsonResponse(404, { message: 'Notificação não encontrada.' });
    }

    NOTIFICACOES_MOCK.forEach((n) => (n.lida = true));
    return jsonResponse(204, null);
  }

  return null;
}

function handleRevisaoConfirmacaoMocks(
  req: HttpRequest<unknown>,
  url: string,
  method: string,
): Observable<HttpResponse<unknown>> | null {
  if (!url.includes('/revisao-confirmacao')) return null;

  if (url.endsWith('/revisao-confirmacao') && method === 'GET') {
    return jsonResponse(200, REVISAO_CONFIRMACAO_MOCK);
  }

  if (url.endsWith('/revisao-confirmacao') && method === 'PATCH') {
    const bodyObj = extrairDadosCorpo(req);
    const confirmado = (bodyObj['confirmado'] as boolean) ?? true;
    return jsonResponse(200, {
      ...REVISAO_CONFIRMACAO_MOCK,
      statusNovo: 'SUBMETIDA',
      bloqueado: true,
      confirmado,
    });
  }

  return null;
}

// --- Funções Auxiliares ---

function jsonResponse(
  status: number,
  body: unknown,
  delayMs = 200,
): Observable<HttpResponse<unknown>> {
  return of(new HttpResponse({ status, body })).pipe(delay(delayMs));
}

function extrairDadosCorpo(req: HttpRequest<unknown>): Record<string, unknown> {
  const bodyObj: Record<string, unknown> = {};
  if (req.body instanceof FormData) {
    req.body.forEach((val, key) => {
      bodyObj[key] = val;
    });
  } else if (typeof req.body === 'object' && req.body !== null) {
    Object.assign(bodyObj, req.body);
  }
  return bodyObj;
}
