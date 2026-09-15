import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BannerErroComponent } from '../../core/components/banner-erro/banner-erro.component';
import { PdfPreviewComponent } from '../../core/components/pdf-preview/pdf-preview.component';
import { SuccessToastComponent } from '../../core/components/success-toast/success-toast.component';
import { FileDropzoneComponent } from '../../core/components/file-dropzone/file-dropzone.component';

import { AtividadeService } from '../atividade.service';
import { SolicitacaoService } from '../../solicitacao/solicitacao.service';
import { AtividadeEdicaoRequest } from './edicao-atividade.model';
import { Atividade } from '../atividade.model';

const FORMATOS_PERMITIDOS = new Set(['application/pdf', 'image/png', 'image/jpeg']);
const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5MB

@Component({
  selector: 'app-edicao-atividade',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    BannerErroComponent,
    SuccessToastComponent,
    FileDropzoneComponent,
    PdfPreviewComponent,
  ],
  templateUrl: './edicao-atividade.component.html',
})
export class EdicaoAtividadeComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly atividadeService = inject(AtividadeService);
  private readonly solicitacaoService = inject(SolicitacaoService);

  atividadeId: number | null = null;
  readonly carregandoDados = signal<boolean>(true);
  readonly carregando = signal<boolean>(false);
  readonly extraindoComIA = signal<boolean>(false);
  readonly erroExtracao = signal<string | null>(null);

  readonly mensagemErro = signal<string | null>(null);
  readonly mensagemSucesso = signal<boolean>(false);
  readonly arquivoAnexado = signal<File | null>(null);
  readonly erroArquivo = signal<string | null>(null);
  readonly dragOver = signal<boolean>(false);

  readonly atividadeOriginal = signal<Atividade | null>(null);
  readonly bloqueado = signal<boolean>(false);
  readonly certificadoAtualRemovido = signal<boolean>(false);

  // Estados do Modal
  readonly modalVisualizacaoAberto = signal<boolean>(false);
  readonly urlPrevia = signal<string | null>(null);
  readonly tipoPrevia = signal<'pdf' | 'imagem'>('pdf');
  readonly tituloPrevia = signal<string>('');
  readonly carregandoPrevia = signal<boolean>(false);
  readonly erroPrevia = signal<string | null>(null);
  private urlObjetoCriada: string | null = null;

  readonly temCertificadoValido = computed<boolean>(() => {
    if (this.arquivoAnexado()) {
      return true;
    }
    return !this.certificadoAtualRemovido() && !!this.atividadeOriginal();
  });

  readonly activityForm: FormGroup = this.fb.group({
    titulo: ['', [Validators.required]],
    instituicao: [''],
    data: ['', [Validators.required]],
    natureza: ['', [Validators.required]],
    categoria: ['', [Validators.required]],
    cargaHoraria: ['', [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.mensagemErro.set('ID de atividade não informado.');
      this.carregandoDados.set(false);
      return;
    }
    this.atividadeId = Number(idParam);
    this.carregarDadosAtividade(this.atividadeId);
  }

  ngOnDestroy(): void {
    this.liberarUrlObjeto();
  }

  carregarDadosAtividade(id: number): void {
    this.carregandoDados.set(true);
    this.mensagemErro.set(null);
    this.atividadeService.buscarPorId(id).subscribe({
      next: (atividade) => {
        this.atividadeOriginal.set(atividade);
        this.activityForm.patchValue({
          titulo: atividade.titulo,
          instituicao: atividade.instituicaoResponsavel,
          data: atividade.dataRealizacao,
          natureza: atividade.natureza,
          categoria: atividade.categoria,
          cargaHoraria: atividade.cargaHorariaEmHoras,
        });
        this.carregandoDados.set(false);
        this.atualizarEstadoBloqueio();
      },
      error: (erro: Error) => {
        this.mensagemErro.set(erro.message);
        this.atualizarEstadoBloqueio();
        this.carregandoDados.set(false);
      },
    });
  }

  private atualizarEstadoBloqueio(): void {
    if (!this.atividadeId) {
      const atvStatus = this.atividadeOriginal()?.status ?? 'PENDENTE';
      this.bloqueado.set(!(atvStatus === 'PENDENTE' || atvStatus === 'COM_PENDENCIAS'));
      if (this.bloqueado()) {
        this.activityForm.disable();
      } else {
        this.activityForm.enable();
      }
      return;
    }
    this.solicitacaoService.verificarEmAbertoComAtividade(this.atividadeId).subscribe({
      next: (emAberto) => {
        const atvStatus = this.atividadeOriginal()?.status ?? 'PENDENTE';
        if (emAberto) {
          this.bloqueado.set(true);
          this.activityForm.disable();
        } else {
          this.bloqueado.set(!(atvStatus === 'PENDENTE' || atvStatus === 'COM_PENDENCIAS'));
          if (this.bloqueado()) {
            this.activityForm.disable();
          } else {
            this.activityForm.enable();
          }
        }
      },
      error: () => {
        const atvStatus = this.atividadeOriginal()?.status ?? 'PENDENTE';
        this.bloqueado.set(!(atvStatus === 'PENDENTE' || atvStatus === 'COM_PENDENCIAS'));
        if (this.bloqueado()) {
          this.activityForm.disable();
        } else {
          this.activityForm.enable();
        }
      },
    });
  }

  isCampoInvalido(nomeCampo: string): boolean {
    const campo = this.activityForm.get(nomeCampo);
    return !!(campo && campo.invalid && (campo.touched || campo.dirty));
  }

  isFormularioInvalido(): boolean {
    return (
      this.activityForm.invalid ||
      this.carregando() ||
      this.carregandoDados() ||
      this.extraindoComIA() ||
      !this.temCertificadoValido()
    );
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.validarEProcessarArquivo(input.files[0]);
    }
  }

  aoSelecionarNovoArquivoComIA(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const arquivo = input.files[0];
    const valido = this.validarEProcessarArquivo(arquivo);
    if (valido) {
      this.extrairDadosComIA(arquivo);
    }
    input.value = '';
  }

  private extrairDadosComIA(file: File): void {
    this.extraindoComIA.set(true);
    this.erroExtracao.set(null);
    this.atividadeService.extrairDadosCertificado(file).subscribe({
      next: (dados) => {
        this.activityForm.patchValue({
          titulo: dados.titulo ?? this.activityForm.value.titulo,
          instituicao: dados.instituicaoResponsavel ?? this.activityForm.value.instituicao,
          data: dados.dataRealizacao ?? this.activityForm.value.data,
          natureza: dados.natureza ?? this.activityForm.value.natureza,
          categoria: dados.categoria ?? this.activityForm.value.categoria,
          cargaHoraria: dados.cargaHoraria ?? this.activityForm.value.cargaHoraria,
        });
        this.extraindoComIA.set(false);
      },
      error: () => {
        this.extraindoComIA.set(false);
        this.erroExtracao.set(
          'Não foi possível extrair os dados com a IA. Os campos mantiveram seus valores.',
        );
      },
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.validarEProcessarArquivo(event.dataTransfer.files[0]);
    }
  }

  removerNovoArquivo(): void {
    this.arquivoAnexado.set(null);
    this.erroArquivo.set(null);
    this.erroExtracao.set(null);
  }

  removerCertificadoAtual(): void {
    this.certificadoAtualRemovido.set(true);
    this.arquivoAnexado.set(null);
    this.erroArquivo.set(null);
  }

  restaurarCertificadoAtual(): void {
    this.certificadoAtualRemovido.set(false);
    this.arquivoAnexado.set(null);
    this.erroArquivo.set(null);
    this.erroExtracao.set(null);
  }

  visualizarCertificadoAtual(): void {
    if (!this.atividadeId) return;
    this.liberarUrlObjeto();
    this.erroPrevia.set(null);
    this.carregandoPrevia.set(true);
    this.modalVisualizacaoAberto.set(true);
    this.tituloPrevia.set(`Certificado - ${this.atividadeOriginal()?.titulo || 'Atividade'}`);

    this.atividadeService.obterCertificado(this.atividadeId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.urlObjetoCriada = url;
        this.urlPrevia.set(url);
        this.tipoPrevia.set(blob.type.includes('image') ? 'imagem' : 'pdf');
        this.carregandoPrevia.set(false);
      },
      error: () => {
        this.carregandoPrevia.set(false);
        this.erroPrevia.set('Não foi possível carregar o arquivo do certificado no servidor.');
      },
    });
  }

  visualizarNovoArquivo(): void {
    const file = this.arquivoAnexado();
    if (!file) return;
    this.liberarUrlObjeto();
    this.erroPrevia.set(null);
    const url = URL.createObjectURL(file);
    this.urlObjetoCriada = url;
    this.urlPrevia.set(url);
    this.tipoPrevia.set(file.type.includes('image') ? 'imagem' : 'pdf');
    this.tituloPrevia.set(file.name);
    this.carregandoPrevia.set(false);
    this.modalVisualizacaoAberto.set(true);
  }

  fecharModalVisualizacao(): void {
    this.modalVisualizacaoAberto.set(false);
    this.urlPrevia.set(null);
    this.erroPrevia.set(null);
    this.liberarUrlObjeto();
  }

  formatarTamanhoArquivo(bytes: number): string {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  onSubmit(): void {
    if (this.bloqueado()) {
      this.mensagemErro.set(
        'Esta atividade está homologada ou não possui pendências. A edição está bloqueada.',
      );
      return;
    }

    if (this.isFormularioInvalido() || !this.atividadeId) {
      this.activityForm.markAllAsTouched();
      if (!this.temCertificadoValido()) {
        this.erroArquivo.set('O comprovante é obrigatório. Anexe um arquivo para continuar.');
      }
      return;
    }

    this.carregando.set(true);
    this.mensagemErro.set(null);

    const formValues = this.activityForm.value;
    const dados: AtividadeEdicaoRequest = {
      titulo: formValues.titulo,
      instituicaoResponsavel: formValues.instituicao,
      dataRealizacao: formValues.data,
      natureza: formValues.natureza,
      categoria: formValues.categoria,
      cargaHoraria: Number(formValues.cargaHoraria),
      arquivo: this.arquivoAnexado(),
    };

    this.atividadeService.atualizar(this.atividadeId, dados).subscribe({
      next: () => {
        this.carregando.set(false);
        this.mensagemSucesso.set(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          this.router.navigate(['/atividades']);
        }, 1500);
      },
      error: (erro: Error) => {
        this.carregando.set(false);
        this.mensagemErro.set(erro.message);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    });
  }

  private validarEProcessarArquivo(file: File): boolean {
    this.erroArquivo.set(null);
    this.erroExtracao.set(null);

    const extensaoValida = /\.(pdf|png|jpe?g)$/i.test(file.name);
    const tipoValido =
      FORMATOS_PERMITIDOS.has(file.type) ||
      file.type === '' ||
      file.type === 'application/octet-stream';

    if (!tipoValido || !extensaoValida) {
      this.erroArquivo.set('Tipo de arquivo inválido. Apenas PDF, PNG ou JPEG são permitidos.');
      this.arquivoAnexado.set(null);
      return false;
    }

    if (file.size > TAMANHO_MAXIMO_BYTES) {
      this.erroArquivo.set('O arquivo excede o limite máximo de 5MB.');
      this.arquivoAnexado.set(null);
      return false;
    }

    this.arquivoAnexado.set(file);
    this.certificadoAtualRemovido.set(false);
    return true;
  }

  private liberarUrlObjeto(): void {
    if (this.urlObjetoCriada) {
      URL.revokeObjectURL(this.urlObjetoCriada);
      this.urlObjetoCriada = null;
    }
  }
}
