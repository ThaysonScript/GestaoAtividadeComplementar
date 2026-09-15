import { describe, it, expect } from 'vitest';
import { calcularResumos, calcularSemAtividades, percentualExibido } from './progresso-shared';
import { ProgressoCargaHoraria } from './progresso.model';

describe('progresso-shared', () => {
  const progressoMock: ProgressoCargaHoraria = {
    acc: {
      horasAcumuladas: 10,
      horasPendentes: 5,
      horasExigidas: 30,
      horasRestantes: 15,
      percentualConcluido: 50,
    },
    acex: {
      horasAcumuladas: 20,
      horasPendentes: 0,
      horasExigidas: 60,
      horasRestantes: 40,
      percentualConcluido: 100,
    },
  };

  it('calcularResumos deve retornar array com ACC e ACEX', () => {
    const resumos = calcularResumos(progressoMock);
    expect(resumos).toHaveLength(2);
    expect(resumos[0].titulo).toBe('ACC');
  });

  it('calcularResumos deve retornar vazio se progresso for null', () => {
    expect(calcularResumos(null)).toEqual([]);
  });

  it('calcularSemAtividades deve ser true quando tudo e zero', () => {
    const vazio = {
      acc: {
        horasAcumuladas: 0,
        horasPendentes: 0,
        horasExigidas: 0,
        horasRestantes: 0,
        percentualConcluido: 0,
      },
      acex: {
        horasAcumuladas: 0,
        horasPendentes: 0,
        horasExigidas: 0,
        horasRestantes: 0,
        percentualConcluido: 0,
      },
    } as ProgressoCargaHoraria;
    expect(calcularSemAtividades(vazio)).toBe(true);
  });

  it('calcularSemAtividades deve ser false quando ha horas acumuladas', () => {
    expect(calcularSemAtividades(progressoMock)).toBe(false);
  });

  it('calcularSemAtividades deve ser false se progresso for null', () => {
    expect(calcularSemAtividades(null)).toBe(false);
  });

  it('percentualExibido deve limitar a 100', () => {
    expect(percentualExibido({ percentualConcluido: 120 } as any)).toBe(100);
  });

  it('percentualExibido deve limitar a 0 se negativo', () => {
    expect(percentualExibido({ percentualConcluido: -10 } as any)).toBe(0);
  });

  it('percentualExibido deve retornar valor exato dentro do intervalo', () => {
    expect(percentualExibido({ percentualConcluido: 75 } as any)).toBe(75);
  });
});
