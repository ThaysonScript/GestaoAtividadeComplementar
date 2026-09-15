import { Component, computed, inject, input, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  readonly dados = signal<DadosSubstituicaoComprovante | null>(null);
  readonly substituindo = signal(false);
  readonly atividadeId = signal<number | null>(null);
  readonly atividadeTitulo = signal<string | null>(null);
  readonly carregando = signal(false);
  readonly arquivo = signal<File | null>(null);
  readonly erroArquivo = signal<string | null>(null);
  readonly bloqueado = computed(() => {
    const id = this.atividadeId();
    if (!id) return true;
    return false;
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
            cargaHoraria: atividade.cargaHorariaEmHoras ?? 0,
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
    const tipoValido = file.type === 'application/pdf' || file.type === 'image/png' || file.type === 'image/jpeg';
    const tamanhoValido = file.size <= 5 * 1024 * 1024;

    if (!tipoValido || !extensaoValida) {
      this.erroArquivo.set('Tipo de arquivo inválido. Apenas PDF, PNG ou JPEG são permitidos.');
      this.arquivo.set(null);
      return false;
    }
    if (!tamanhoValido) {
      this.erroArquivo.set('O arquivo excede o limite máximo de 5MB.');
      this.arquivo.set(null);
      return false;
    }
    this.arquivo.set(file);
    this.substituindo.set(true);
    this.substituicaoService.substituir(this.atividadeId() ?? 0, file).subscribe({
      next: () => {
        this.substituindo.set(false);
      },
      error: () => {
        this.substituindo.set(false);
        this.erroArquivo.set('Não foi possível substituir o comprovante. Tente novamente.');
      },
    });
    return true;
  }

  salvarEdicao(): void {
    if (this.edicaoForm.invalid) {
      this.edicaoForm.markAllAsTouched();
      return;
    }
    // Simula a edicao; no futuro seria integrado ao backend
    this.dados.set({
      ...this.dados() ?? { atividadeId: 0, titulo: '', comprovanteRemovido: false, novoComprovante: null, validacaoTamanho: true, validacaoTipo: true, bloqueado: false },
      comprovanteRemovido: false,
      bloqueado: true,
    });
  }

  removerArquivo(): void {
    this.arquivo.set(null);
    this.erroArquivo.set(null);
  }
}
