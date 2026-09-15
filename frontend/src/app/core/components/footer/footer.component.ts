import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer
      class="bg-gradient-to-b from-[#003629] to-[#1b4d3e] border-t border-[#003629]/20 mt-auto shadow-[inset_0_2px_10px_rgba(255,255,255,0.05)]"
    >
      <div
        class="w-full py-8 px-4 md:px-8 max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#e6efe9]/90"
      >
        <div class="flex items-center gap-2 font-bold text-white text-sm tracking-wide">
          <span class="material-symbols-outlined text-lg">school</span>
          <span>SGAC — UFAPE</span>
        </div>
        <p class="text-center opacity-80">
          © 2026 SGAC — Universidade Federal do Agreste de Pernambuco. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  `,
})
export class FooterComponent {}
