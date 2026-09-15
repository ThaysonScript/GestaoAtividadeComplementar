import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { API_BASE_URL } from '../api.config';
import { mensagemDoBackend, traduzirErroComum } from '../core/interceptors/erro-util';
import { SolicitacaoDetalhe, SolicitacaoResumo } from './solicitacao.model';

@Injectable({
  providedIn: 'root',
})
export class SolicitacaoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/solicitacoes`;

  submeter(solicitacaoId?: number, atividadeId?: number): Observable<SolicitacaoDetalhe> {
    const url = solicitacaoId ? `${this.apiUrl}/${solicitacaoId}/atividades` : this.apiUrl;
    return this.http
      .post<SolicitacaoDetalhe>(url, solicitacaoId ? (atividadeId ?? null) : undefined)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          throwError(() => new Error(this.traduzirErroSubmissao(error))),
        ),
      );
  }

  listar(): Observable<SolicitacaoResumo[]> {
    return this.http.get<SolicitacaoResumo[]>(this.apiUrl).pipe(
      map((solicitacoes) => solicitacoes ?? []),
      catchError((error: HttpErrorResponse) =>
        throwError(() => new Error(this.traduzirErroLeitura(error))),
      ),
    );
  }

  detalhar(id: number): Observable<SolicitacaoDetalhe> {
    return this.http
      .get<SolicitacaoDetalhe>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          throwError(() => new Error(this.traduzirErroLeitura(error))),
        ),
      );
  }

  private traduzirErroSubmissao(error: HttpErrorResponse): string {
    const comum = traduzirErroComum(error);
    if (comum) return comum;
    if (error.status === 403) {
      return (
        mensagemDoBackend(error) ?? 'Apenas estudantes podem solicitar a validação de atividades.'
      );
    }
    if (error.status === 409) {
      return (
        mensagemDoBackend(error) ??
        'Você já possui uma solicitação em aberto. Acompanhe o andamento antes de enviar outra.'
      );
    }
    if (error.status === 422 || error.status === 400) {
      return (
        mensagemDoBackend(error) ??
        'Cadastre ao menos uma atividade antes de enviar o relatório para validação.'
      );
    }
    return (
      mensagemDoBackend(error) ??
      'Não foi possível enviar o relatório para validação. Tente novamente.'
    );
  }

  private traduzirErroLeitura(error: HttpErrorResponse): string {
    const comum = traduzirErroComum(error);
    if (comum) return comum;
    if (error.status === 404) {
      return mensagemDoBackend(error) ?? 'Solicitação não encontrada.';
    }
    return (
      mensagemDoBackend(error) ?? 'Não foi possível carregar suas solicitações. Tente novamente.'
    );
  }
}
