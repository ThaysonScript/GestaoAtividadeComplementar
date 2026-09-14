import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RevisaoConfirmacaoComponent } from './revisao-confirmacao.component';

const mockDados = {
  solicitacaoId: 8,
  itensCorrigidos: [{ atividadeId: 3, titulo: 'Monitoria', cargaHoraria: 30, natureza: 'ACC' }],
  novosComprovantes: ['certificado_corrigido.pdf'],
  observacoesAvaliador: 'Reenviar com assinatura.',
  statusAnterior: 'COM_PENDENCIAS',
  statusNovo: 'SUBMETIDA',
};

describe('RevisaoConfirmacaoComponent', () => {
  let fixture: ComponentFixture<RevisaoConfirmacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevisaoConfirmacaoComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(RevisaoConfirmacaoComponent);
    fixture.componentInstance.dados = mockDados as any;
    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deve exibir dados corrigidos e novos comprovantes', () => {
    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('Monitoria');
    expect(texto).toContain('certificado_corrigido.pdf');
  });

  it('deve bloquear edicao e retornar ao modo leitura apos confirmacao', () => {
    const componente = fixture.componentInstance;
    componente.confirmar();
    fixture.detectChanges();
    expect(componente.bloqueado()).toBe(true);
    expect(componente.modoLeitura()).toBe(true);
  });
});
