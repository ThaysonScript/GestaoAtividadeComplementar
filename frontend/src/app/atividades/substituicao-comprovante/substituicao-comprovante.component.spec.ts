import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { SubstituicaoComprovanteComponent } from './substituicao-comprovante.component';

describe('SubstituicaoComprovanteComponent', () => {
  let fixture: ComponentFixture<SubstituicaoComprovanteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubstituicaoComprovanteComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SubstituicaoComprovanteComponent);
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
});
