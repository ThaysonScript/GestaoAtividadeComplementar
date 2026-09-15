import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { SubstituicaoComprovanteComponent } from './substituicao-comprovante.component';

describe('SubstituicaoComprovanteComponent', () => {
  let fixture: ComponentFixture<SubstituicaoComprovanteComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubstituicaoComprovanteComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SubstituicaoComprovanteComponent);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.componentInstance.dados.set({
      atividadeId: 1,
      titulo: 'Teste',
      comprovanteRemovido: false,
      novoComprovante: null,
      validacaoTamanho: true,
      validacaoTipo: true,
      bloqueado: false,
    });
    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deve bloquear edicao quando atividade nao tem pendencias', () => {
    fixture.componentInstance.dados.set({
      atividadeId: 1,
      titulo: 'Homologada',
      comprovanteRemovido: false,
      novoComprovante: null,
      validacaoTamanho: true,
      validacaoTipo: true,
      bloqueado: true,
    });
    fixture.detectChanges();
    expect(fixture.componentInstance.bloqueado()).toBe(true);
  });

  it('deve validar arquivo por tamanho', () => {
    const componente = fixture.componentInstance;
    const fileGrande = new File(['x'.repeat(6 * 1024 * 1024)], 'grande.pdf', {
      type: 'application/pdf',
    });
    componente.onFileSelected({ target: { files: [fileGrande] } } as any);
    expect(componente.erroArquivo()).toContain('excede');
  });

  it('deve remover arquivo', () => {
    fixture.componentInstance.removerArquivo();
    expect(fixture.componentInstance.arquivo()).toBeNull();
  });

  it('deve calcular campos alterados', () => {
    fixture.componentInstance.edicaoForm.patchValue({
      natureza: 'NOVO',
      cargaHoraria: '40',
      descricao: 'Desc',
    });
    const campos = (fixture.componentInstance as any).calcularCamposAlterados();
    expect(Array.isArray(campos)).toBe(true);
  });

  it('deve bloquear edicao quando bloqueado', () => {
    fixture.componentInstance.dados.set({
      atividadeId: 1,
      titulo: 'Homologada',
      comprovanteRemovido: false,
      novoComprovante: null,
      validacaoTamanho: true,
      validacaoTipo: true,
      bloqueado: true,
    });
    fixture.detectChanges();
    expect(fixture.componentInstance.bloqueado()).toBe(true);
  });

  it('deve permitir substituicao se ha parecer de CORRECAO', () => {
    fixture.componentInstance.pareceres.set([
      {
        id: 1,
        atividadeId: 1,
        dataAvaliacao: '2026-01-01',
        statusSolicitacao: 'COM_PENDENCIAS',
        tipoParecer: 'CORRECAO',
        justificativa: 'Erro',
        artigoRegulamento: 'Art. 1',
        cargaHorariaAproveitavel: 10,
      } as any,
    ]);
    fixture.componentInstance.dados.set({
      atividadeId: 1,
      titulo: 'Teste',
      comprovanteRemovido: false,
      novoComprovante: null,
      validacaoTamanho: true,
      validacaoTipo: true,
      bloqueado: true,
    });
    fixture.detectChanges();
    expect(fixture.componentInstance.bloqueado()).toBe(false);
  });

  it('deve validar arquivo valido', () => {
    const componente = fixture.componentInstance;
    const file = new File(['conteudo'], 'teste.pdf', { type: 'application/pdf' });
    componente.onFileSelected({ target: { files: [file] } } as any);
    expect(componente.arquivo()).toBeTruthy();
    expect(componente.erroArquivo()).toBeNull();
  });

  it('deve validar arquivo tipo invalido', () => {
    const componente = fixture.componentInstance;
    const file = new File(['conteudo'], 'teste.txt', { type: 'text/plain' });
    componente.onFileSelected({ target: { files: [file] } } as any);
    expect(componente.erroArquivo()).toContain('Tipo de arquivo inválido');
  });

  it('deve validar arquivo com integridade invalida', () => {
    const componente = fixture.componentInstance;
    const file = new File([], 'teste.pdf', { type: 'application/pdf' });
    componente.onFileSelected({ target: { files: [file] } } as any);
    expect(componente.erroArquivo()).toContain('corrompido');
  });

  it('deve calcular campos alterados com arquivo', () => {
    const componente = fixture.componentInstance;
    componente.arquivo.set(new File(['x'], 'teste.pdf', { type: 'application/pdf' }));
    componente.edicaoForm.patchValue({ natureza: 'ACC', cargaHoraria: '10', descricao: 'Novo' });
    (componente as any).valoresOriginais = {
      natureza: 'ACEX',
      cargaHoraria: '20',
      descricao: 'Antigo',
      arquivo: false,
    };
    const campos = (componente as any).calcularCamposAlterados();
    expect(campos).toContain('Comprovante substituído');
  });

  it('deve armazenar campos alterados no localStorage', () => {
    const store: Record<string, string> = {};
    const mockStorage = {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => (store[k] = v),
      removeItem: (k: string) => delete store[k],
    };
    vi.stubGlobal('localStorage', mockStorage);
    const componente = fixture.componentInstance;
    componente.arquivo.set(new File(['x'], 'teste.pdf', { type: 'application/pdf' }));
    componente.edicaoForm.patchValue({ natureza: 'NOVO', cargaHoraria: '30', descricao: 'Desc' });
    (componente as any).valoresOriginais = {
      natureza: 'VELHO',
      cargaHoraria: '10',
      descricao: 'Antigo',
      arquivo: false,
    };
    (componente as any).armazenarCamposAlterados(5);
    const item = (globalThis as any).localStorage.getItem('sgac_revisao_campos_5');
    expect(item).toBeTruthy();
  });

  it('deve marcar formulario como tocado ao salvar com form invalido', () => {
    const componente = fixture.componentInstance;
    componente.salvarEdicao();
    expect(componente.edicaoForm.touched).toBe(true);
  });

  it('deve definir valores originais corretamente na inicializacao', () => {
    const reqAtividade = httpMock.expectOne((r) => r.url.includes('/atividades/'));
    reqAtividade.flush({
      id: 1,
      titulo: 'Teste',
      natureza: 'ACC',
      cargaHorariaEmHoras: 10,
      status: 'PENDENTE',
    });
    const reqHistorico = httpMock.expectOne((r) => r.url.includes('/historico-pareceres/'));
    reqHistorico.flush([]);
    const reqSolicitacao = httpMock.expectOne((r) => r.url.includes('/solicitacoes/'));
    reqSolicitacao.flush({ status: 'COM_PENDENCIAS' });
    fixture.detectChanges();
    expect((fixture.componentInstance as any).valoresOriginais).not.toBeNull();
  });
});
