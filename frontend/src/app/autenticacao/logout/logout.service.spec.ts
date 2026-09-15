import '@angular/compiler';
import { EnvironmentInjector, Injector, runInInjectionContext } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { LogoutService } from './logout.service';
import { API_BASE_URL } from '../../api.config';

describe('LogoutService', () => {
  let service: LogoutService;
  let httpSpy: { post: Mock };
  let testInjector: EnvironmentInjector;

  beforeEach(() => {
    httpSpy = { post: vi.fn().mockReturnValue(of(void 0)) };

    testInjector = Injector.create({
      providers: [{ provide: HttpClient, useValue: httpSpy }],
    }) as EnvironmentInjector;

    service = runInInjectionContext(testInjector, () => new LogoutService());
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve enviar requisicao POST para o endpoint correto de logout', () => {
    service.logout().subscribe();

    expect(httpSpy.post).toHaveBeenCalledWith(`${API_BASE_URL}/auth/logout`, {});
  });

  it('deve tratar erro no logout', () => {
    httpSpy.post.mockReturnValue(throwError(() => new Error('Erro no logout')));
    service.logout().subscribe({ error: (e: Error) => expect(e.message).toBe('Erro no logout') });
  });
});
