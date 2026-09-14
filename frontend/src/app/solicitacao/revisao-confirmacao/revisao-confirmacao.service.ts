import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { API_BASE_URL } from '../api.config';
import { DadosRevisaoReenvio } from './revisao-confirmacao.model';
import { mensagemDoBackend, traduzirErroComum } from '../core/interceptors/erro-util';

@Injectable({
  providedIn: 'root',
})
export class RevisaoConfirmacaoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/revisao-confirmacao`;

  listar(): Observable<DadosRevisaoReenvio> {
    return this.http.get<DadosRevisaoReenvio>(this.apiUrl).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() => new Error(this.traduzirErro(error))),
      ),
    );
  }

  confirmar(id: number): Observable<DadosRevisaoReenvio> {
    return this.http.patch<DadosRevisaoReenvio>(this.apiUrl, { confirmado: true, solicitacaoId: id }).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() => new Error(this.traduzirErro(error))),
      ),
    );
  }

  private traduzirErro(error: HttpErrorResponse): string {
    const comum = traduzirErroComum(error);
    if (comum) return comum;
    if (error.status === 403) return mensagemDoBackend(error) ?? 'Apenas estudantes podem confirmar o reenvio.';
    return mensagemDoBackend(error) ?? 'Não foi possível confirmar o reenvio. Tente novamente.';
  }
}
