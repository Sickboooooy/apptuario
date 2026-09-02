import { describe, expect, it } from 'vitest';

describe('buildPrompt', () => {
  it('states the three hard rules and includes the tokenized text', async () => {
    const { buildPrompt } = await import('./prompt');

    const prompt = buildPrompt(
      'notificación personal',
      'razón',
      'Se notifica a QUEJOSO_1 en DOMICILIO_1.',
    );

    expect(prompt).toContain('QUEJOSO_1 en DOMICILIO_1');
    expect(prompt).toMatch(/conserva.*token/i);
    expect(prompt).toMatch(/no introduzcas/i);
    expect(prompt).toContain('[DATO_FALTANTE]');
  });
});
