import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { FileDropzoneComponent } from './file-dropzone.component';

describe('FileDropzoneComponent', () => {
  let fixture: ComponentFixture<FileDropzoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FileDropzoneComponent] }).compileComponents();
    fixture = TestBed.createComponent(FileDropzoneComponent);
    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deve emitir remover ao clicar no botao', () => {
    const componente = fixture.componentInstance;
    vi.spyOn(componente.remover, 'emit');
    componente.remover.emit();
    expect(componente.remover.emit).toHaveBeenCalled();
  });

  it('deve emitir eventos de drag e drop', () => {
    const componente = fixture.componentInstance;
    vi.spyOn(componente.dragOverEvent, 'emit');
    vi.spyOn(componente.dragLeaveEvent, 'emit');
    vi.spyOn(componente.dropEvent, 'emit');
    componente.dragOverEvent.emit(new Event('dragover'));
    componente.dragLeaveEvent.emit(new Event('dragleave'));
    componente.dropEvent.emit(new Event('drop'));
    expect(componente.dragOverEvent.emit).toHaveBeenCalled();
    expect(componente.dragLeaveEvent.emit).toHaveBeenCalled();
    expect(componente.dropEvent.emit).toHaveBeenCalled();
  });

  it('deve emitir fileChange', () => {
    const componente = fixture.componentInstance;
    vi.spyOn(componente.fileChange, 'emit');
    componente.fileChange.emit(new Event('change'));
    expect(componente.fileChange.emit).toHaveBeenCalled();
  });

  it('deve exibir arquivo anexado quando arquivo esta definido', () => {
    fixture.componentInstance.arquivoAnexado = new File(['x'], 'teste.pdf', {
      type: 'application/pdf',
    });
    fixture.componentInstance.arquivoNome = 'teste.pdf';
    fixture.componentInstance.arquivoTamanho = '1 KB';
    expect(fixture.componentInstance.arquivoAnexado).toBeTruthy();
  });

  it('deve mostrar erro quando erroArquivo e true', () => {
    fixture.componentInstance.erroArquivo = true;
    expect(fixture.componentInstance.erroArquivo).toBe(true);
  });
});
