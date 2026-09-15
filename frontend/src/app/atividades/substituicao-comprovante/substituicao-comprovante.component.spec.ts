import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubstituicaoComprovanteComponent } from './substituicao-comprovante.component';

describe('SubstituicaoComprovanteComponent', () => {
  let fixture: ComponentFixture<SubstituicaoComprovanteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SubstituicaoComprovanteComponent] }).compileComponents();
    fixture = TestBed.createComponent(SubstituicaoComprovanteComponent);
    fixture.componentInstance.atividade = { id: 1, titulo: 'Teste', status: 'PENDENTE', pendencias: true };
    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deve bloquear edicao quando atividade nao tem pendencias', () => {
    fixture.componentInstance.atividade = { id: 1, titulo: 'Homologada', status: 'APROVADA', pendencias: false };
    fixture.detectChanges();
    expect(fixture.componentInstance.bloqueado()).toBe(true);
  });

  it('deve validar arquivo por tamanho', () => {
    const componente = fixture.componentInstance;
    const fileGrande = new File(['x'.repeat(6 * 1024 * 1024)], 'grande.pdf', { type: 'application/pdf' });
    componente.onFileSelected({ target: { files: [fileGrande] } } as any);
    expect(componente.erroArquivo()).toContain('excede');
  });
});
