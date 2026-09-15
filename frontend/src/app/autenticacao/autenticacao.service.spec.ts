import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AutenticacaoService } from './autenticacao.service';
import { API_BASE_URL } from '../api.config';

const LOGIN_URL = `${API_BASE_URL}/auth/login`;

const createStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
  };
};

function gerarJwtFake(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload)).replace(/=/g, '');
  return `${header}.${body}.assinatura_fake`;
}

describe('AutenticacaoService', () => {
  let service: AutenticacaoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    vi.stubGlobal('localStorage', createStorageMock());
    vi.stubGlobal('sessionStorage', createStorageMock());
    TestBed.configureTestingModule({
      providers: [AutenticacaoService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AutenticacaoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.unstubAllGlobals();
  });

  it('deve realizar login com sucesso e salvar token', () => {
    const mockResponse = { token: 'token123', tokenType: 'Bearer' };
    service
      .login({ emailOrRegistration: 'user@test.com', password: '123' } as any)
      .subscribe((res: any) => {
        expect(res).toEqual(mockResponse);
      });

    const req = httpMock.expectOne(LOGIN_URL);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('deve cadastrar usuário com sucesso', () => {
    const payload = { fullName: 'Nome', emailOrRegistration: 'email@test.com', password: '123' };
    service.cadastrar(payload).subscribe((res: any) => {
      expect(res).toBe('Usuário cadastrado com sucesso');
    });

    const req = httpMock.expectOne(`${API_BASE_URL}/auth/cadastro`);
    expect(req.request.method).toBe('POST');
    req.flush('Usuário cadastrado com sucesso');
  });

  it('deve traduzir erro 400 com mensagem no cadastro', () => {
    let mensagem = '';
    service.cadastrar({ fullName: 'A', emailOrRegistration: 'b', password: 'c' }).subscribe({
      error: (e: Error) => (mensagem = e.message),
    });
    httpMock.expectOne(`${API_BASE_URL}/auth/cadastro`).flush(
      { message: 'E-mail já cadastrado' },
      {
        status: 400,
        statusText: 'Bad Request',
      },
    );
    expect(mensagem).toBe('E-mail já cadastrado');
  });

  it('deve traduzir erro 400 com texto puro no cadastro', () => {
    let mensagem = '';
    service.cadastrar({ fullName: 'A', emailOrRegistration: 'b', password: 'c' }).subscribe({
      error: (e: Error) => (mensagem = e.message),
    });
    httpMock.expectOne(`${API_BASE_URL}/auth/cadastro`).flush('Erro em texto puro', {
      status: 400,
      statusText: 'Bad Request',
    });
    expect(mensagem).toBe('Erro em texto puro');
  });

  it('deve traduzir erro 401/403 no login', () => {
    let mensagem = '';
    service.login({ emailOrRegistration: 'a', password: 'b' } as any).subscribe({
      error: (e: Error) => (mensagem = e.message),
    });
    httpMock.expectOne(LOGIN_URL).flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(mensagem).toBe('Credenciais inválidas.');
  });

  it('deve traduzir erro 500 generico no login', () => {
    let mensagem = '';
    service.login({ emailOrRegistration: 'a', password: 'b' } as any).subscribe({
      error: (e: Error) => (mensagem = e.message),
    });
    httpMock.expectOne(LOGIN_URL).flush(null, { status: 500, statusText: 'Internal Error' });
    expect(mensagem).toBe('Ocorreu um erro ao realizar o login. Tente novamente.');
  });

  it('deve lidar com ambiente sem localStorage/window de forma segura', () => {
    vi.stubGlobal('window', undefined);
    vi.stubGlobal('localStorage', undefined);

    expect(() => service.saveToken('token', 'Bearer')).not.toThrow();
    expect(service.getToken()).toBeNull();
    expect(service.getTokenType()).toBe('Bearer');
    expect(() => service.encerrarSessao()).not.toThrow();
  });

  it('deve decodificar perfil do payload JWT corretamente', () => {
    const token = gerarJwtFake({
      sub: '123',
      role: 'ESTUDANTE',
      perfil: 'ESTUDANTE',
      roles: ['ESTUDANTE'],
    });
    service.saveToken(token, 'Bearer');
    expect(service.perfilAtual()).toBeTruthy();
  });

  it('deve retornar null no perfilAtual em caso de JWT invalido ou sem payload', () => {
    service.saveToken('invalid.payload');
    expect(service.perfilAtual()).toBeNull();

    service.saveToken('singletoken');
    expect(service.perfilAtual()).toBeNull();
  });

  it('deve salvar sessao corretamente', () => {
    service.salvarSessao({ token: 'token123', tipo: 'Bearer' } as any);
    expect(service.getToken()).toBe('token123');
  });

  it('deve verificar se esta autenticado', () => {
    expect(service.estaAutenticado()).toBe(false);
    service.saveToken('token', 'Bearer');
    expect(service.estaAutenticado()).toBe(true);
  });

  it('deve obter role corretamente', () => {
    service.saveToken(gerarJwtFake({ role: 'AVALIADOR' }), 'Bearer');
    expect(service.getRole()).toBe('AVALIADOR');
  });

  it('deve encerrar sessao corretamente', () => {
    service.saveToken('token', 'Bearer');
    service.encerrarSessao();
    expect(service.getToken()).toBeNull();
  });

  it('deve traduzir erro 409 no cadastro', () => {
    let mensagem = '';
    service.cadastrar({ fullName: 'A', emailOrRegistration: 'b', password: 'c' }).subscribe({
      error: (e: Error) => (mensagem = e.message),
    });
    httpMock
      .expectOne(`${API_BASE_URL}/auth/cadastro`)
      .flush({ message: 'Conflito' }, { status: 409, statusText: 'Conflict' });
    expect(mensagem).toBe('Este e-mail já está cadastrado.');
  });

  it('deve traduzir erro 0 no login', () => {
    let mensagem = '';
    service.login({ emailOrRegistration: 'a', password: 'b' } as any).subscribe({
      error: (e: Error) => (mensagem = e.message),
    });
    const req = httpMock.expectOne(LOGIN_URL);
    req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown' });
    expect(mensagem).toBe('Não foi possível conectar ao servidor. Verifique sua conexão.');
  });

  it('deve retornar null quando perfilAtual nao encontra role', () => {
    service.saveToken(gerarJwtFake({ sub: '1' }), 'Bearer');
    expect(service.perfilAtual()).toBeNull();
  });
});
