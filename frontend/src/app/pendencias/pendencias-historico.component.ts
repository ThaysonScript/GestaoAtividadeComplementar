import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  AtividadeComHistoricoParecer,
  TipoParecerAvaliador,
} from '../atividades/historico-parecer.model';

@Component({
  selector: 'app-pendencias-historico',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pendencias-historico.component.html',
})
export class PendenciasHistoricoComponent implements OnInit {
  readonly carregando = signal(true);
  readonly mensagemErro = signal<string | null>(null);
  readonly atividades = signal<AtividadeComHistoricoParecer[]>([]);

  readonly semAtividades = computed(() => this.atividades().length === 0 && !this.carregando());

  readonly temPendencias = computed(() => this.atividades().some((a) => a.pendenciasAtivas));

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando.set(true);
    this.mensagemErro.set(null);

    // Dados simulados conforme escopo da feature #288
    const mock: AtividadeComHistoricoParecer[] = [
      {
        atividadeId: 1,
        titulo: 'Monitoria Acadêmica de Algoritmos',
        natureza: 'ACC',
        categoria: 'ENSINO',
        cargaHorariaEmHoras: 30,
        statusAtual: 'COM_PENDENCIAS',
        pendenciasAtivas: true,
        pareceres: [
          {
            id: 101,
            atividadeId: 1,
            dataAvaliacao: '2026-08-20T10:30:00',
            statusSolicitacao: 'COM_PENDENCIAS',
            tipoParecer: 'CORRECAO',
            justificativa: 'Comprovante ilegível ou sem assinatura do orientador.',
            observacoes: 'Reenviar com assinatura digitalizada.',
            artigoRegulamento: 'Art. 12',
            cargaHorariaAproveitavel: 20,
          },
          {
            id: 102,
            atividadeId: 1,
            dataAvaliacao: '2026-09-05T14:00:00',
            statusSolicitacao: 'APROVADA',
            tipoParecer: 'PRE_APROVADO',
            justificativa: 'Documentação completa e dentro dos critérios.',
            observacoes: 'Mantido conforme regulamento.',
            artigoRegulamento: 'Art. 12',
            cargaHorariaAproveitavel: 30,
          },
        ],
      },
      {
        atividadeId: 2,
        titulo: 'Projeto de Extensão AgroTI Comunitária',
        natureza: 'ACEX',
        categoria: 'EXTENSAO',
        cargaHorariaEmHoras: 60,
        statusAtual: 'APROVADA',
        pendenciasAtivas: false,
        pareceres: [
          {
            id: 201,
            atividadeId: 2,
            dataAvaliacao: '2026-08-22T11:00:00',
            statusSolicitacao: 'APROVADA',
            tipoParecer: 'PRE_APROVADO',
            justificativa: 'Atividade compatível com os critérios do PPC.',
            artigoRegulamento: 'Art. 14',
            cargaHorariaAproveitavel: 60,
          },
        ],
      },
    ];

    setTimeout(() => {
      this.atividades.set(mock);
      this.carregando.set(false);
    }, 400);
  }

  classeParecer(tipo: TipoParecerAvaliador): string {
    switch (tipo) {
      case 'CORRECAO':
        return 'bg-[#ffdad6] text-[#93000a] border-[#ba1a1a]/30';
      case 'MANTIDO':
        return 'bg-[#fff8e1] text-[#7a5900] border-[#ffe082]';
      case 'PRE_APROVADO':
        return 'bg-[#e6efe9] text-[#00522e] border-[#003629]/30';
      default:
        return 'bg-[#f8f9fa] text-[#404945]';
    }
  }

  rotuloParecer(tipo: TipoParecerAvaliador): string {
    switch (tipo) {
      case 'CORRECAO':
        return 'Correção necessária';
      case 'MANTIDO':
        return 'Mantido';
      case 'PRE_APROVADO':
        return 'Pré-aprovado';
      default:
        return tipo;
    }
  }

  dataFormatada(valor: string): string {
    const partes = valor.split('T')[0].split('-');
    if (partes.length !== 3) return valor;
    const [ano, mes, dia] = partes;
    return `${dia}/${mes}/${ano}`;
  }
}
