import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ThemeService] });
    service = TestBed.inject(ThemeService);
  });

  it('deve criar servico', () => {
    expect(service).toBeTruthy();
  });

  it('deve iniciar com modo claro', () => {
    expect(service.isDark()).toBe(false);
  });

  it('deve alternar para dark', () => {
    service.toggle();
    expect(service.isDark()).toBe(true);
  });
});
