import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_BASE_URL } from '../api.config';
import { DadosSubstituicaoComprovante } from '../atividades/substituicao-comprovante/substituicao-comprovante.model';
import { mensagemDoBackend, traduzirErroComum } from '../core/interceptors/erro-util';

@Injectable({ providedIn: 'root' })
export class SubstituicaoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/substituicao-comprovante`;

  substituir(id: number, arquivo: File | null): Observable<DadosSubstituicaoComprovante> {
    const formData = new FormData();
    formData.append('atividadeId', id.toString());
    if (arquivo) formData.append('arquivo', arquivo);
    return this.http.post<DadosSubstituicaoComprovante>(this.apiUrl, formData).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() => new Error(this.traduzirErro(error))),
      ),
    );
  }

  private traduzirErro(error: HttpErrorResponse): string {
    const comum = traduzirErroComum(error);
    if (comum) return comum;
    if (error.status === 403) return mensagemDoBackend(error) ?? 'Apenas estudantes podem substituir comprovantes.';
    if (error.status === 422) return mensagemDoBackend(error) ?? 'Arquivo inválido ou atividade sem pendência.';
    return mensagemDoBackend(error) ?? 'Não foi possível substituir o comprovante. Tente novamente.';
  }
}
