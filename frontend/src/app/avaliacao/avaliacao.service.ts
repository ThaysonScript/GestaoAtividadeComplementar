import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { API_BASE_URL } from '../api.config';
import { mensagemDoBackend, traduzirErroComum } from '../core/interceptors/erro-util';
import { StatusSolicitacao } from '../solicitacao/solicitacao.model';
import {
  AvaliacaoRequest,
  DecisaoAvaliacao,
  SolicitacaoAvaliadorDetalhe,
  SolicitacaoAvaliadorResumo,
} from './avaliacao.model';

@Injectable({
  providedIn: 'root',
})
export class AvaliacaoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/solicitacoes`;
  private readonly avaliacaoRealizada = new BehaviorSubject<void>(undefined);

  readonly onAvaliacaoRealizada = this.avaliacaoRealizada.asObservable();

  consultar(status?: StatusSolicitacao): Observable<SolicitacaoAvaliadorResumo[]> {
    const params = status ? new HttpParams().set('status', status) : new HttpParams();
    return this.http.get<SolicitacaoAvaliadorResumo[]>(`${this.apiUrl}/avaliacao`, { params }).pipe(
      map((solicitacoes) => solicitacoes ?? []),
      catchError((error: HttpErrorResponse) =>
        throwError(() => new Error(this.traduzirErroConsulta(error))),
      ),
    );
  }

  listarPendentes(): Observable<SolicitacaoAvaliadorResumo[]> {
    return this.consultar();
  }

  detalhar(id: number): Observable<SolicitacaoAvaliadorDetalhe> {
    return this.http
      .get<SolicitacaoAvaliadorDetalhe>(`${this.apiUrl}/${id}/avaliacao`)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          throwError(() => new Error(this.traduzirErroDetalhe(error))),
        ),
      );
  }

  avaliarPorAtividade(
    solicitacaoId: number,
    atividadeId: number,
    decisao: DecisaoAvaliacao,
    justificativa?: string,
  ): Observable<SolicitacaoAvaliadorDetalhe> {
    const payload: AvaliacaoRequest = {
      decisao,
      justificativa: justificativa?.trim() || undefined,
    };

    return this.http
      .patch<SolicitacaoAvaliadorDetalhe>(
        `${this.apiUrl}/${solicitacaoId}/atividades/${atividadeId}/avaliacao`,
        payload,
      )
      .pipe(
        map((res) => {
          this.avaliacaoRealizada.next();
          return res;
        }),
        catchError((error: HttpErrorResponse) =>
          throwError(() => new Error(this.traduzirErroAvaliacao(error))),
        ),
      );
  }

  avaliar(
    id: number,
    decisao: DecisaoAvaliacao,
    justificativa?: string,
  ): Observable<SolicitacaoAvaliadorDetalhe> {
    const payload: AvaliacaoRequest = {
      decisao,
      justificativa: justificativa?.trim() || undefined,
    };

    return this.http
      .patch<SolicitacaoAvaliadorDetalhe>(`${this.apiUrl}/${id}/avaliacao`, payload)
      .pipe(
        map((res) => {
          this.avaliacaoRealizada.next();
          return res;
        }),
        catchError((error: HttpErrorResponse) =>
          throwError(() => new Error(this.traduzirErroAvaliacao(error))),
        ),
      );
  }

  private traduzirErroConsulta(error: HttpErrorResponse): string {
    const comum = traduzirErroComum(error);
    if (comum) return comum;
    if (error.status === 403) {
      return (
        mensagemDoBackend(error) ??
        'Apenas avaliadores podem consultar as solicitações de validação.'
      );
    }
    return (
      mensagemDoBackend(error) ?? 'Não foi possível carregar as solicitações. Tente novamente.'
    );
  }

  private traduzirErroDetalhe(error: HttpErrorResponse): string {
    const comum = traduzirErroComum(error);
    if (comum) return comum;
    if (error.status === 404) {
      return mensagemDoBackend(error) ?? 'Solicitação não encontrada.';
    }
    return (
      mensagemDoBackend(error) ??
      'Não foi possível carregar os detalhes da solicitação. Tente novamente.'
    );
  }

  private traduzirErroAvaliacao(error: HttpErrorResponse): string {
    const comum = traduzirErroComum(error);
    if (comum) return comum;
    if (error.status === 409) {
      return (
        mensagemDoBackend(error) ??
        'Esta solicitação já foi avaliada ou seu status foi alterado por outro usuário.'
      );
    }
    if (error.status === 400) {
      return mensagemDoBackend(error) ?? 'Dados da avaliação inválidos.';
    }
    if (error.status === 404) {
      return mensagemDoBackend(error) ?? 'Solicitação não encontrada.';
    }
    return (
      mensagemDoBackend(error) ??
      'Não foi possível registrar a decisão da solicitação. Tente novamente.'
    );
  }
}
