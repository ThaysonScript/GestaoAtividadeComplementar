import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PdfPreviewComponent } from './pdf-preview.component';

describe('PdfPreviewComponent', () => {
  let fixture: ComponentFixture<PdfPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfPreviewComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(PdfPreviewComponent);
    fixture.detectChanges();
  });

  it('deve criar componente', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deve abrir janela quando url e definida', () => {
    const componente = fixture.componentInstance;
    const spy = spyOn(window, 'open');
    componente.url = 'http://teste.pdf';
    expect(spy).toHaveBeenCalledWith('http://teste.pdf', '_blank');
  });
});
