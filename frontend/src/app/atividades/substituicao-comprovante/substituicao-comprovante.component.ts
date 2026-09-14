import { Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DadosSubstituicaoComprovante } from './substituicao-comprovante.model';

@Component({
  selector: 'app-substituicao-comprovante',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './substituicao-comprovante.component.html',
})
export class SubstituicaoComprovanteComponent {
  readonly atividade = input.required<{ id: number; titulo: string; status?: string; pendencias?: boolean }>();
  readonly carregando = signal(false);
  readonly arquivo = signal<File | null>(null);
  readonly erroArquivo = signal<string | null>(null);
  readonly bloqueado = computed(() => this.atividade() && !this.atividade().pendencias);

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
    return true;
  }

  removerArquivo(): void {
    this.arquivo.set(null);
    this.erroArquivo.set(null);
  }
}
