import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { API_BASE_URL } from '../api.config';
import {
  Atividade,
  AtividadeListagemDTO,
  AtividadeRequest,
  AtividadeResponse,
  ExtracaoCertificadoResponseDTO,
  FiltroAtividades,
  ParecerResponseDTO,
} from './atividade.model';
import { AtividadeEdicaoRequest } from './edicao/edicao-atividade.model';

@Injectable({
  providedIn: 'root',
})
export class AtividadeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/atividades`;

  cadastrar(request: AtividadeRequest): Observable<AtividadeResponse> {
    const formData = new FormData();
    formData.append('titulo', request.titulo);
    formData.append('instituicaoResponsavel', request.instituicaoResponsavel);
    formData.append('dataRealizacao', request.dataRealizacao);
    formData.append('cargaHoraria', request.cargaHoraria.toString());
    formData.append('natureza', request.natureza);
    formData.append('categoria', request.categoria);
    formData.append('arquivo', request.arquivo);

    return this.http
      .post<AtividadeResponse>(this.apiUrl, formData)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          throwError(() => new Error(this.traduzirErroCadastro(error))),
        ),
      );
  }

  atualizar(id: number, request: AtividadeEdicaoRequest): Observable<AtividadeResponse> {
    const formData = new FormData();
    formData.append('titulo', request.titulo);
    formData.append('instituicaoResponsavel', request.instituicaoResponsavel ?? '');
    formData.append('dataRealizacao', request.dataRealizacao);
    formData.append('cargaHoraria', request.cargaHoraria.toString());
    formData.append('natureza', request.natureza);
    formData.append('categoria', request.categoria);
    if (request.arquivo) {
      formData.append('arquivo', request.arquivo);
    }

    return this.http
      .put<AtividadeResponse>(`${this.apiUrl}/${id}`, formData)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          throwError(() => new Error(this.traduzirErroEdicao(error))),
        ),
      );
  }

  buscarPorId(id: number): Observable<Atividade> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((res) => {
        const dto = res as AtividadeListagemDTO;
        if (!dto || !dto.id) {
          throw new Error('Atividade não encontrada.');
        }
        return this.paraAtividade(dto);
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => new Error('Atividade não encontrada.'));
      }),
    );
  }

  obterParecer(id: number): Observable<ParecerResponseDTO> {
    return this.http.get<ParecerResponseDTO>(`${this.apiUrl}/${id}/parecer`).pipe(
      catchError((error: HttpErrorResponse) => {
        const mensagem = error.error?.message || error.message || 'Erro ao carregar parecer da IA.';
        return throwError(() => new Error(mensagem));
      }),
    );
  }

  extrairDadosCertificado(arquivo: File): Observable<ExtracaoCertificadoResponseDTO> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    return this.http.post<ExtracaoCertificadoResponseDTO>(
      `${this.apiUrl}/extrair-certificado`,
      formData,
    );
  }

  obterCertificado(id: number): Observable<Blob> {
    return this.http
      .get(`${this.apiUrl}/${id}/certificado`, { responseType: 'blob' })
      .pipe(
        catchError((_) =>
          throwError(() => new Error('Não foi possível carregar o arquivo do certificado.')),
        ),
      );
  }

  excluir(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          throwError(() => new Error(this.traduzirErroExclusao(error))),
        ),
      );
  }

  listar(filtro: FiltroAtividades = {}): Observable<Atividade[]> {
    let params = new HttpParams();
    if (filtro.natureza) {
      params = params.set('natureza', filtro.natureza);
    }
    if (filtro.categoria) {
      params = params.set('categoria', filtro.categoria);
    }

    return this.http.get<AtividadeListagemDTO[]>(this.apiUrl, { params }).pipe(
      map((dtos) => (dtos ?? []).map((dto) => this.paraAtividade(dto))),
      catchError((error: HttpErrorResponse) =>
        throwError(() => new Error(this.traduzirErroListagem(error))),
      ),
    );
  }

  private paraAtividade(dto: AtividadeListagemDTO): Atividade {
    return {
      id: dto?.id ?? 0,
      titulo: dto?.titulo ?? '',
      instituicaoResponsavel: dto?.instituicaoResponsavel ?? '',
      dataRealizacao: dto?.dataRealizacao ?? '',
      cargaHorariaEmHoras: dto?.cargaHorariaEmHoras ?? 0,
      natureza: dto?.natureza ?? '',
      categoria: dto?.categoria ?? '',
      dataCadastro: dto?.dataCadastro ?? null,
      status: dto?.status ?? 'PENDENTE',
    };
  }

  private traduzirErroCadastro(error: HttpErrorResponse): string {
    if (error.status === 401) return 'Sessão expirada. Faça login novamente.';
    if (error.status === 0) return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    if (error.status === 403)
      return this.mensagemDoBackend(error) ?? 'Apenas estudantes podem cadastrar atividades.';
    return (
      this.mensagemDoBackend(error) ?? 'Não foi possível cadastrar a atividade. Tente novamente.'
    );
  }

  private traduzirErroEdicao(error: HttpErrorResponse): string {
    if (error.status === 401) return 'Sessão expirada. Faça login novamente.';
    if (error.status === 0) return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    if (error.status === 403)
      return this.mensagemDoBackend(error) ?? 'Você não tem permissão para editar esta atividade.';
    if (error.status === 404) return this.mensagemDoBackend(error) ?? 'Atividade não encontrada.';
    return (
      this.mensagemDoBackend(error) ?? 'Não foi possível processar a atividade. Tente novamente.'
    );
  }

  private traduzirErroExclusao(error: HttpErrorResponse): string {
    if (error.status === 401) return 'Sessão expirada. Faça login novamente.';
    if (error.status === 0) return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    if (error.status === 403)
      return this.mensagemDoBackend(error) ?? 'Você só pode excluir suas próprias atividades.';
    if (error.status === 404) return this.mensagemDoBackend(error) ?? 'Atividade não encontrada.';
    return (
      this.mensagemDoBackend(error) ?? 'Não foi possível excluir a atividade. Tente novamente.'
    );
  }

  private traduzirErroListagem(error: HttpErrorResponse): string {
    if (error.status === 401) return 'Sessão expirada. Faça login novamente.';
    if (error.status === 0) return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    if (error.status === 403)
      return this.mensagemDoBackend(error) ?? 'Apenas estudantes podem consultar suas atividades.';
    return (
      this.mensagemDoBackend(error) ?? 'Não foi possível carregar suas atividades. Tente novamente.'
    );
  }

  private mensagemDoBackend(error: HttpErrorResponse): string | null {
    const corpo: unknown = error.error;
    if (typeof corpo === 'string' && corpo.trim().length > 0) return corpo.trim();
    const mensagem = (corpo as { message?: unknown } | null)?.message;
    if (typeof mensagem === 'string' && mensagem.trim().length > 0) return mensagem.trim();
    return null;
  }
}
