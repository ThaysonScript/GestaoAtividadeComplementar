import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { API_BASE_URL } from '../api.config';
import {
  AtividadeComHistoricoParecer,
  ParecerAvaliadorHistorico,
} from '../atividades/historico-parecer.model';
import { mensagemDoBackend, traduzirErroComum } from '../core/interceptors/erro-util';

@Injectable({
  providedIn: 'root',
})
export class HistoricoParecerService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/historico-pareceres`;

  listarPorEstudante(): Observable<AtividadeComHistoricoParecer[]> {
    return this.http.get<AtividadeComHistoricoParecer[]>(this.apiUrl).pipe(
      map((lista) => lista ?? []),
      catchError((error: HttpErrorResponse) =>
        throwError(() => new Error(this.traduzirErro(error))),
      ),
    );
  }

  buscarPorAtividade(id: number): Observable<ParecerAvaliadorHistorico[]> {
    return this.http.get<ParecerAvaliadorHistorico[]>(`${this.apiUrl}/atividade/${id}`).pipe(
      map((lista) => lista ?? []),
      catchError((error: HttpErrorResponse) =>
        throwError(() => new Error(this.traduzirErro(error))),
      ),
    );
  }

  private traduzirErro(error: HttpErrorResponse): string {
    const comum = traduzirErroComum(error);
    if (comum) return comum;
    if (error.status === 403)
      return mensagemDoBackend(error) ?? 'Apenas estudantes podem consultar o histórico.';
    return (
      mensagemDoBackend(error) ??
      'Não foi possível carregar o histórico de pareceres. Tente novamente.'
    );
  }
}
