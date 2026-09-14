import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormErrorComponent } from './form-error.component';

describe('FormErrorComponent', () => {
  let fixture: ComponentFixture<FormErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FormErrorComponent] }).compileComponents();
    fixture = TestBed.createComponent(FormErrorComponent);
    fixture.componentInstance.visivel = true;
    fixture.componentInstance.mensagem = 'Erro de teste';
    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deve exibir mensagem quando visivel', () => {
    expect(fixture.nativeElement.textContent).toContain('Erro de teste');
  });
});
