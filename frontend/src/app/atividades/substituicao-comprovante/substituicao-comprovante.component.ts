import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DadosSubstituicaoComprovante } from './substituicao-comprovante.model';
import { SubstituicaoService } from '../../solicitacao/substituicao.service';
import { AtividadeService } from '../atividade.service';

@Component({
  selector: 'app-substituicao-comprovante',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './substituicao-comprovante.component.html',
})
export class SubstituicaoComprovanteComponent implements OnInit {
  private readonly atividadeService = inject(AtividadeService);
  private readonly substituicaoService = inject(SubstituicaoService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly dados = signal<DadosSubstituicaoComprovante | null>(null);
  readonly substituindo = signal(false);
  readonly atividadeId = signal<number | null>(null);
  readonly atividadeTitulo = signal<string | null>(null);
  readonly carregando = signal(false);
  readonly arquivo = signal<File | null>(null);
  readonly erroArquivo = signal<string | null>(null);
  readonly erroSubstituicao = signal<string | null>(null);
  readonly bloqueado = computed(() => {
    const d = this.dados();
    if (d) return d.bloqueado;
    const id = this.atividadeId();
    return !id || true;
  });

  edicaoForm = this.fb.group({
    natureza: ['', [Validators.required]],
    cargaHoraria: ['', [Validators.required, Validators.min(1)]],
    descricao: [''],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.atividadeId.set(id);
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
    this.substituicaoService
      .atualizarMetadados(atual.atividadeId, {
        natureza: valores.natureza as string,
        cargaHoraria: valores.cargaHoraria ? (Number(valores.cargaHoraria) as number) : undefined,
        descricao: valores.descricao ?? '',
        comprovanteRemovido: false,
        novoComprovante: this.arquivo(),
        bloqueado: atual.bloqueado,
      })
      .subscribe({
        next: (res) => {
          this.erroSubstituicao.set(null);
          this.dados.set({ ...res, bloqueado: atual.bloqueado });
          this.router.navigate(['/revisao-confirmacao']);
        },
        error: (err: Error) => {
          this.erroSubstituicao.set(
            err.message ??
              'Não foi possível processar a substituição. Verifique se a atividade possui pendências abertas.',
          );
          this.dados.set({ ...atual, comprovanteRemovido: false, bloqueado: atual.bloqueado });
        },
      });
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
