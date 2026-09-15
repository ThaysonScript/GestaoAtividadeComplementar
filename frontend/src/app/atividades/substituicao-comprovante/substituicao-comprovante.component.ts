import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DadosSubstituicaoComprovante } from './substituicao-comprovante.model';
import { SubstituicaoService } from '../../solicitacao/substituicao.service';
import { AtividadeService } from '../atividade.service';
import { HistoricoParecerService } from '../../pendencias/historico-parecer.service';
import { ParecerAvaliadorHistorico } from '../historico-parecer.model';

@Component({
  selector: 'app-substituicao-comprovante',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './substituicao-comprovante.component.html',
})
export class SubstituicaoComprovanteComponent implements OnInit {
  private readonly atividadeService = inject(AtividadeService);
  private readonly substituicaoService = inject(SubstituicaoService);
  private readonly solicitacaoService = inject(SubstituicaoService);
  private readonly historicoService = inject(HistoricoParecerService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  readonly dados = signal<DadosSubstituicaoComprovante | null>(null);
  readonly substituindo = signal(false);
  readonly solicitacaoId = signal<number | null>(null);
  readonly atividadeId = signal<number | null>(null);
  readonly atividadeTitulo = signal<string | null>(null);
  readonly carregando = signal(false);
  readonly arquivo = signal<File | null>(null);
  readonly erroArquivo = signal<string | null>(null);
  readonly erroSubstituicao = signal<string | null>(null);
  readonly pareceres = signal<ParecerAvaliadorHistorico[]>([]);
  readonly carregandoHistorico = signal(false);
  readonly erroHistorico = signal<string | null>(null);
  readonly bloqueado = computed(() => {
    const d = this.dados();
    // Se há parecer de CORRECAO no histórico, permite substituição
    const temCorrecao = this.pareceres().some((p) => p.tipoParecer === 'CORRECAO');
    if (temCorrecao) return false;
    if (d) return d.bloqueado;
    return false;
  });

  edicaoForm = this.fb.group({
    natureza: ['', [Validators.required]],
    cargaHoraria: ['', [Validators.required, Validators.min(1)]],
    descricao: [''],
  });
  private valoresOriginais: {
    natureza: string;
    cargaHoraria: string;
    descricao: string;
    arquivo: boolean;
  } | null = null;

  ngOnInit(): void {
    const solicitacaoIdParam = this.route.snapshot.paramMap.get('solicitacaoId');
    const idParam = this.route.snapshot.paramMap.get('id');
    if (solicitacaoIdParam) {
      this.solicitacaoId.set(Number(solicitacaoIdParam));
    }
    if (idParam) {
      const id = Number(idParam);
      this.atividadeId.set(id);
      this.carregarDadosAtividade(id);
      this.carregarHistorico(id);
      if (solicitacaoIdParam) {
        this.carregarSolicitacao(Number(solicitacaoIdParam));
      }
    }
  }

  carregarSolicitacao(solicitacaoId: number): void {
    const url = `/api/v1/solicitacoes/${solicitacaoId}`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        if (res && res.status === 'COM_PENDENCIAS') {
          const d = this.dados();
          if (d) {
            this.dados.set({ ...d, bloqueado: true });
          }
        }
      },
      error: () => {
        // Ignora erro se não conseguir buscar a solicitação
      },
    });
  }

  carregarDadosAtividade(id: number): void {
    this.carregando.set(true);
    this.atividadeService.buscarPorId(id).subscribe({
      next: (atividade) => {
        this.atividadeTitulo.set(atividade.titulo);
        this.dados.set({
          atividadeId: atividade.id,
          titulo: atividade.titulo,
          comprovanteRemovido: false,
          novoComprovante: null,
          validacaoTamanho: true,
          validacaoTipo: true,
          bloqueado: !(atividade.status === 'PENDENTE' || atividade.status === 'COM_PENDENCIAS'),
        });
        this.valoresOriginais = {
          natureza: atividade.natureza ?? '',
          cargaHoraria: String(atividade.cargaHorariaEmHoras ?? 0),
          descricao: atividade.titulo ?? '',
          arquivo: false,
        };
        this.edicaoForm.patchValue({
          natureza: atividade.natureza ?? '',
          cargaHoraria: String(atividade.cargaHorariaEmHoras ?? 0),
          descricao: atividade.titulo ?? '',
        });
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
      },
    });
  }

  carregarHistorico(id: number): void {
    this.carregandoHistorico.set(true);
    this.erroHistorico.set(null);
    this.historicoService.buscarPorAtividade(id).subscribe({
      next: (pareceres) => {
        this.pareceres.set(pareceres);
        this.carregandoHistorico.set(false);
      },
      error: (err: Error) => {
        this.erroHistorico.set(err.message);
        this.carregandoHistorico.set(false);
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.validarArquivo(file);
    input.value = '';
  }

  private validarArquivo(file: File): boolean {
    this.erroArquivo.set(null);
    const extensaoValida = /\.(pdf|png|jpe?g)$/i.test(file.name);
    const tipoValido =
      file.type === 'application/pdf' || file.type === 'image/png' || file.type === 'image/jpeg';
    const tamanhoValido = file.size <= 5 * 1024 * 1024;
    const integridadeValida = file.size > 0 && file.name.trim().length > 0;

    if (!tipoValido || !extensaoValida) {
      this.erroArquivo.set('Tipo de arquivo inválido. Apenas PDF, PNG ou JPEG são permitidos.');
      this.arquivo.set(null);
      return false;
    }
    if (!integridadeValida) {
      this.erroArquivo.set('Arquivo corrompido ou vazio. Verifique a integridade do comprovante.');
      this.arquivo.set(null);
      return false;
    }
    if (!tamanhoValido) {
      this.erroArquivo.set('O arquivo excede o limite máximo de 5MB.');
      this.arquivo.set(null);
      return false;
    }
    this.arquivo.set(file);
    this.substituindo.set(false);
    this.erroArquivo.set(null);
    return true;
  }

  salvarEdicao(): void {
    if (this.edicaoForm.invalid) {
      this.edicaoForm.markAllAsTouched();
      return;
    }
    const valores = this.edicaoForm.value;
    const atual = this.dados() ?? {
      atividadeId: 0,
      titulo: '',
      comprovanteRemovido: false,
      novoComprovante: null,
      validacaoTamanho: true,
      validacaoTipo: true,
      bloqueado: false,
    };
    const arquivo = this.arquivo();

    const processarAtualizacao = () => {
      this.substituicaoService
        .atualizarMetadados(atual.atividadeId, {
          natureza: valores.natureza as string,
          cargaHoraria: valores.cargaHoraria ? (Number(valores.cargaHoraria) as number) : undefined,
          descricao: valores.descricao ?? '',
          comprovanteRemovido: false,
          novoComprovante: null,
          bloqueado: atual.bloqueado,
        })
        .subscribe({
          next: (res: DadosSubstituicaoComprovante) => {
            this.erroSubstituicao.set(null);
            this.armazenarCamposAlterados(atual.atividadeId);
            this.dados.set({ ...res, bloqueado: atual.bloqueado });
            this.router.navigate([
              '/revisao-confirmacao',
              this.solicitacaoId() ?? atual.atividadeId,
            ]);
          },
          error: (err: Error) => {
            this.erroSubstituicao.set(
              err.message ??
                'Não foi possível processar a substituição. Verifique se a atividade possui pendências abertas.',
            );
            this.dados.set({ ...atual, comprovanteRemovido: false, bloqueado: atual.bloqueado });
          },
        });
    };

    if (arquivo) {
      this.substituicaoService.substituir(atual.atividadeId, arquivo).subscribe({
        next: () => processarAtualizacao(),
        error: (err: Error) => {
          this.erroSubstituicao.set(
            err.message ??
              'Não foi possível enviar o novo comprovante. Verifique se a atividade possui pendências abertas.',
          );
        },
      });
    } else {
      processarAtualizacao();
    }
  }

  private calcularCamposAlterados(): string[] {
    const alterados: string[] = [];
    const orig = this.valoresOriginais;
    const form = this.edicaoForm.value;
    if (!orig) return alterados;
    if (this.arquivo()) alterados.push('Comprovante substituído');
    if (form.natureza && form.natureza !== orig.natureza) alterados.push('Natureza alterada');
    if (form.cargaHoraria != null && String(form.cargaHoraria) !== orig.cargaHoraria)
      alterados.push('Carga horária alterada');
    if (
      form.descricao != null &&
      form.descricao !== orig.descricao &&
      form.descricao.trim().length > 0
    )
      alterados.push('Descrição alterada');
    return alterados;
  }

  private armazenarCamposAlterados(id: number): void {
    const campos = this.calcularCamposAlterados();
    if (campos.length > 0) {
      localStorage.setItem(`sgac_revisao_campos_${id}`, JSON.stringify(campos));
    }
  }

  removerArquivo(): void {
    this.arquivo.set(null);
    this.erroArquivo.set(null);
    const atual = this.dados();
    if (atual) {
      this.dados.set({ ...atual, novoComprovante: null, comprovanteRemovido: false });
    }
  }
}
