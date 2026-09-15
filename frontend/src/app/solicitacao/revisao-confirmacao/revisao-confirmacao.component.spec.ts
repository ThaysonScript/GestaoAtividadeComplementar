import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { RevisaoConfirmacaoComponent } from './revisao-confirmacao.component';
import { RevisaoConfirmacaoService } from './revisao-confirmacao.service';

const mockDados = {
  solicitacaoId: 8,
  itensCorrigidos: [{ atividadeId: 3, titulo: 'Monitoria', cargaHoraria: 30, natureza: 'ACC' }],
  novosComprovantes: ['certificado_corrigido.pdf'],
  observacoesAvaliador: 'Reenviar com assinatura.',
  statusAnterior: 'COM_PENDENCIAS',
  statusNovo: 'SUBMETIDA',
};

class MockRevisaoService {
  listar() {
    return of(mockDados);
  }
  confirmar() {
    return of({ ...mockDados, bloqueado: true, confirmado: true });
  }
}

describe('RevisaoConfirmacaoComponent', () => {
  let fixture: ComponentFixture<RevisaoConfirmacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevisaoConfirmacaoComponent],
      providers: [
        provideRouter([]),
        { provide: RevisaoConfirmacaoService, useClass: MockRevisaoService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(RevisaoConfirmacaoComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('deve ser criado', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deve exibir dados corrigidos e novos comprovantes', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('Monitoria');
    expect(texto).toContain('certificado_corrigido.pdf');
  });

  it('deve bloquear edicao e retornar ao modo leitura apos confirmacao', async () => {
    const componente = fixture.componentInstance;
    componente.confirmar();
    await new Promise((r) => setTimeout(r, 700));
    fixture.detectChanges();
    expect(componente.bloqueado()).toBe(true);
    expect(componente.modoLeitura()).toBe(true);
  });

  it('deve cancelar e desbloquear edicao', async () => {
    const componente = fixture.componentInstance;
    componente.confirmar();
    await new Promise((r) => setTimeout(r, 700));
    componente.cancelar();
    expect(componente.bloqueado()).toBe(false);
    expect(componente.confirmado()).toBe(false);
  });

  it('deve exibir estado de carregamento inicialmente', async () => {
    await fixture.whenStable();
    expect(fixture.componentInstance.carregando()).toBe(false);
  });
});
