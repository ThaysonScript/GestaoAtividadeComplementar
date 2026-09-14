import { ComponentFixture, TestBed } from '@angular/core/testing';
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
    spyOn(componente.remover, 'emit');
    componente.remover.emit();
    expect(componente.remover.emit).toHaveBeenCalled();
  });
});
