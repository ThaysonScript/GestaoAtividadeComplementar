import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GestaoUsuariosComponent } from './gestao-usuarios.component';
import { AdminService } from '../admin.service';
import { UsuarioAdmin } from '../admin.model';

const usuariosMock: UsuarioAdmin[] = [
  {
    id: 1,
    nome: 'Docente Avaliador',
    email: 'docente@ufape.edu.br',
    role: 'AVALIADOR',
    ativo: true,
    detalheInstitucional: 'Computação',
  },
];

describe('GestaoUsuariosComponent', () => {
  let component: GestaoUsuariosComponent;
  let fixture: ComponentFixture<GestaoUsuariosComponent>;
  let adminServiceSpy: {
    listarUsuarios: ReturnType<typeof vi.fn>;
    alternarStatusUsuario: ReturnType<typeof vi.fn>;
    cadastrarUsuarioInstitucional: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    adminServiceSpy = {
      listarUsuarios: vi.fn().mockReturnValue(of(usuariosMock)),
      alternarStatusUsuario: vi.fn(),
      cadastrarUsuarioInstitucional: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [GestaoUsuariosComponent],
      providers: [{ provide: AdminService, useValue: adminServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(GestaoUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('deve carregar e listar os usuarios cadastrados', () => {
    expect(component).toBeTruthy();
    expect(adminServiceSpy.listarUsuarios).toHaveBeenCalled();
    expect(component.usuarios()).toHaveLength(1);
    expect(fixture.nativeElement.textContent).toContain('Docente Avaliador');
  });

  it('deve alternar status do usuario com sucesso', () => {
    const inativado = { ...usuariosMock[0], ativo: false };
    adminServiceSpy.alternarStatusUsuario.mockReturnValue(of(inativado));

    component.alternarStatus(usuariosMock[0]);
    expect(adminServiceSpy.alternarStatusUsuario).toHaveBeenCalledWith(1);
    expect(component.usuarios()[0].ativo).toBe(false);
  });

  it('deve cadastrar usuário institucional', () => {
    component.formUsuario.setValue({
      nome: 'Novo Usuario',
      email: 'novo@ufape.edu.br',
      senha: 'senha1234',
      role: 'AVALIADOR',
      registro: '',
      areaAtuacao: '',
      setor: '',
      nivelAcesso: 'TOTAL',
    });
    adminServiceSpy.cadastrarUsuarioInstitucional.mockReturnValue(
      of({ ...usuariosMock[0], id: 2 }),
    );
    component.salvarUsuario();
    expect(adminServiceSpy.cadastrarUsuarioInstitucional).toHaveBeenCalled();
  });

  it('não deve salvar com formulário inválido', () => {
    component.formUsuario.reset();
    component.salvarUsuario();
    expect(adminServiceSpy.cadastrarUsuarioInstitucional).not.toHaveBeenCalled();
  });

  it('deve abrir e fechar modal', () => {
    component.abrirModal();
    expect(component.modalAberto()).toBe(true);
    component.fecharModal();
    expect(component.modalAberto()).toBe(false);
  });

  it('deve alternar status com erro', () => {
    adminServiceSpy.alternarStatusUsuario.mockReturnValue(throwError(() => new Error('Erro')));
    component.alternarStatus(usuariosMock[0]);
    expect(component.mensagemErro()).toBe('Erro');
  });

  it('deve tratar erro ao carregar usuarios', () => {
    adminServiceSpy.listarUsuarios.mockReturnValue(throwError(() => new Error('Falha')));
    component.carregarUsuarios();
    expect(component.mensagemErro()).toBe('Falha');
  });

  it('deve tratar erro ao cadastrar usuario', () => {
    adminServiceSpy.cadastrarUsuarioInstitucional.mockReturnValue(
      throwError(() => new Error('Cadastro falhou')),
    );
    component.formUsuario.setValue({
      nome: 'Novo Usuario',
      email: 'novo@ufape.edu.br',
      senha: 'senha1234',
      role: 'AVALIADOR',
      registro: '',
      areaAtuacao: '',
      setor: '',
      nivelAcesso: 'TOTAL',
    });
    component.salvarUsuario();
    expect(component.mensagemErro()).toBe('Cadastro falhou');
    expect(component.salvando()).toBe(false);
  });
});
