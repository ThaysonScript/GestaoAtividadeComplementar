import { Routes } from '@angular/router';
import { authGuard } from './autenticacao/auth.guard';
import { roleGuard } from './autenticacao/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./autenticacao/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./autenticacao/registro/registro.component').then((m) => m.RegistroComponent),
  },
  {
    path: 'admin/usuarios',
    loadComponent: () =>
      import('./admin/usuarios/gestao-usuarios.component').then((m) => m.GestaoUsuariosComponent),
    canActivate: [authGuard, roleGuard(['ADMINISTRADOR'])],
  },
  {
    path: 'admin/cursos',
    loadComponent: () =>
      import('./admin/cursos/gestao-cursos.component').then((m) => m.GestaoCursosComponent),
    canActivate: [authGuard, roleGuard(['ADMINISTRADOR'])],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard, roleGuard(['ESTUDANTE'])],
  },
  {
    path: 'progresso',
    loadComponent: () =>
      import('./atividades/progresso/progresso.component').then((m) => m.ProgressoComponent),
    canActivate: [authGuard, roleGuard(['ESTUDANTE'])],
  },
  {
    path: 'atividades/cadastro',
    loadComponent: () =>
      import('./atividades/cadastro/cadastro-atividade.component').then(
        (m) => m.CadastroAtividadeComponent,
      ),
    canActivate: [authGuard, roleGuard(['ESTUDANTE'])],
  },
  {
    path: 'atividades/edicao/:id',
    loadComponent: () =>
      import('./atividades/edicao/edicao-atividade.component').then(
        (m) => m.EdicaoAtividadeComponent,
      ),
    canActivate: [authGuard, roleGuard(['ESTUDANTE'])],
  },
  {
    path: 'atividades',
    loadComponent: () =>
      import('./atividades/listagem/listagem-atividades.component').then(
        (m) => m.ListagemAtividadesComponent,
      ),
    canActivate: [authGuard, roleGuard(['ESTUDANTE'])],
  },
  {
    path: 'regulamentos/gestao',
    loadComponent: () =>
      import('./regulamentos/gestao-regulamentos.component').then(
        (m) => m.GestaoRegulamentosComponent,
      ),
    canActivate: [authGuard, roleGuard(['ADMINISTRADOR', 'AVALIADOR'])],
  },
  {
    path: 'relatorio',
    loadComponent: () =>
      import('./relatorio/relatorio.component').then((m) => m.RelatorioComponent),
    canActivate: [authGuard, roleGuard(['ESTUDANTE'])],
  },
  {
    path: 'solicitacoes',
    loadComponent: () =>
      import('./solicitacao/acompanhamento/acompanhamento-solicitacoes.component').then(
        (m) => m.AcompanhamentoSolicitacoesComponent,
      ),
    canActivate: [authGuard, roleGuard(['ESTUDANTE'])],
  },
  {
    path: 'notificacoes',
    loadComponent: () =>
      import('./notificacao/lista/lista-notificacoes.component').then(
        (m) => m.ListaNotificacoesComponent,
      ),
    canActivate: [authGuard, roleGuard(['ESTUDANTE', 'AVALIADOR', 'ADMINISTRADOR'])],
  },
  {
    path: 'logout',
    loadComponent: () =>
      import('./autenticacao/logout/logout.component').then((m) => m.LogoutComponent),
    canActivate: [authGuard],
  },
  {
    path: 'avaliacao',
    loadComponent: () =>
      import('./avaliacao/fila/fila-solicitacoes.component').then(
        (m) => m.FilaSolicitacoesComponent,
      ),
    canActivate: [authGuard, roleGuard(['AVALIADOR', 'ADMINISTRADOR'])],
  },
  {
    path: 'avaliacao/solicitacoes',
    loadComponent: () =>
      import('./avaliacao/consulta/consulta-solicitacoes.component').then(
        (m) => m.ConsultaSolicitacoesComponent,
      ),
    canActivate: [authGuard, roleGuard(['AVALIADOR', 'ADMINISTRADOR'])],
  },
  {
    path: 'avaliacao/solicitacoes/:id',
    loadComponent: () =>
      import('./avaliacao/detalhe/detalhe-avaliacao.component').then(
        (m) => m.DetalheAvaliacaoComponent,
      ),
    canActivate: [authGuard, roleGuard(['AVALIADOR', 'ADMINISTRADOR'])],
  },
  {
    path: 'revisao-confirmacao',
    loadComponent: () =>
      import('./solicitacao/revisao-confirmacao/revisao-confirmacao.component').then(
        (m) => m.RevisaoConfirmacaoComponent,
      ),
    canActivate: [authGuard, roleGuard(['ESTUDANTE'])],
  },
  {
    path: 'pendencias',
    loadComponent: () =>
      import('./pendencias/pendencias-historico.component').then(
        (m) => m.PendenciasHistoricoComponent,
      ),
    canActivate: [authGuard, roleGuard(['ESTUDANTE'])],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
